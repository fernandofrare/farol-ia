import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farol IA — Atendimento por WhatsApp com Inteligência Artificial",
  description:
    "A mesma IA das grandes, sem a complexidade, sem o preço absurdo. Atendimento automático no seu WhatsApp por R$147/mês.",
  metadataBase: new URL("https://farolia.store"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
