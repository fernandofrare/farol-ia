import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Rotas que exigem login. Sem sessão válida → redireciona para /login.
const ROTAS_PROTEGIDAS = [
  "/dashboard",
  "/minha-ia",
  "/crm",
  "/comecar",
  "/indicar",
  "/assinatura",
  "/configuracoes",
  "/suporte",
];

// Cabeçalhos de segurança aplicados a todas as respostas.
function comHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseUrl} https://*.supabase.co`,
    "img-src 'self' data: blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const exigeLogin = ROTAS_PROTEGIDAS.some((r) => path.startsWith(r));

  // Rotas públicas (landing, /login, /cadastro, /termos...) NÃO consultam o Supabase.
  // Se o Supabase estiver fora/pausado, o site público continua no ar.
  if (!exigeLogin) {
    return comHeaders(response);
  }

  // Rotas protegidas: valida a sessão. Com try/catch + timeout, uma falha do Supabase
  // manda pro /login rápido em vez de travar a requisição (evita 504).
  let res = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          res = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 4000)
    );
    const result: any = await Promise.race([supabase.auth.getUser(), timeout]);
    user = result && result.data ? result.data.user : null;
  } catch {
    user = null;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return comHeaders(NextResponse.redirect(url));
  }

  return comHeaders(res);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
