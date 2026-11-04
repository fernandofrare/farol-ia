import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Gerencia o CATÁLOGO EM ARQUIVO (PDF ou imagem) do cliente.
// POST (multipart, campo "file"): sobe o arquivo no bucket privado "catalogos"
//   e grava catalogo_midia_* na linha do cliente.
// DELETE: remove o arquivo e limpa as colunas.
// O upload usa a sessão do usuário (RLS garante que ele só escreve na própria pasta).

const TIPOS_OK: Record<string, { tipo: "image" | "document"; ext: string }> = {
  "application/pdf": { tipo: "document", ext: "pdf" },
  "image/jpeg": { tipo: "image", ext: "jpg" },
  "image/png": { tipo: "image", ext: "png" },
  "image/webp": { tipo: "image", ext: "webp" },
};
const TAMANHO_MAX = 20 * 1024 * 1024; // 20 MB

async function clienteDoUsuario(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado.", status: 401 as const };
  const { data: cliente } = await supabase
    .from("clients")
    .select("id, catalogo_midia_url")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cliente) return { erro: "Cliente não encontrado.", status: 404 as const };
  return { cliente };
}

export async function POST(req: Request) {
  const supabase = createClient();
  const ctx = await clienteDoUsuario(supabase);
  if ("erro" in ctx) return NextResponse.json({ erro: ctx.erro }, { status: ctx.status });
  const cliente = ctx.cliente;

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });

  const info = TIPOS_OK[file.type];
  if (!info) {
    return NextResponse.json(
      { erro: "Formato não aceito. Envie um PDF ou uma imagem (JPG, PNG, WEBP)." },
      { status: 415 }
    );
  }
  if (file.size > TAMANHO_MAX) {
    return NextResponse.json({ erro: "Arquivo muito grande (máx. 20 MB)." }, { status: 413 });
  }

  const path = `${cliente.id}/catalogo-${randomUUID()}.${info.ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const up = await supabase.storage.from("catalogos").upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (up.error) {
    console.error("[catalogo upload]", up.error.message);
    return NextResponse.json({ erro: "Falha ao enviar o arquivo." }, { status: 502 });
  }

  // Remove o arquivo anterior, se havia.
  if (cliente.catalogo_midia_url && cliente.catalogo_midia_url !== path) {
    await supabase.storage.from("catalogos").remove([cliente.catalogo_midia_url]);
  }

  const nome = file.name || `catalogo.${info.ext}`;
  const { error: eUp } = await supabase
    .from("clients")
    .update({
      catalogo_midia_url: path,
      catalogo_midia_tipo: info.tipo,
      catalogo_midia_nome: nome,
      catalogo_midia_mime: file.type,
    })
    .eq("id", cliente.id);
  if (eUp) {
    console.error("[catalogo upload] update", eUp.message);
    return NextResponse.json({ erro: "Falha ao registrar o catálogo." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    catalogo_midia_url: path,
    catalogo_midia_tipo: info.tipo,
    catalogo_midia_nome: nome,
  });
}

export async function DELETE() {
  const supabase = createClient();
  const ctx = await clienteDoUsuario(supabase);
  if ("erro" in ctx) return NextResponse.json({ erro: ctx.erro }, { status: ctx.status });
  const cliente = ctx.cliente;

  if (cliente.catalogo_midia_url) {
    await supabase.storage.from("catalogos").remove([cliente.catalogo_midia_url]);
  }
  await supabase
    .from("clients")
    .update({
      catalogo_midia_url: null,
      catalogo_midia_tipo: null,
      catalogo_midia_nome: null,
      catalogo_midia_mime: null,
    })
    .eq("id", cliente.id);

  return NextResponse.json({ ok: true });
}
