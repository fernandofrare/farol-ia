// Service worker minimo da Farol IA — habilita instalacao (PWA).
// Sem cache agressivo de proposito: o painel e dinamico e nao pode servir versao velha.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passa direto para a rede (sem interceptar). Presenca do handler habilita o install.
});
