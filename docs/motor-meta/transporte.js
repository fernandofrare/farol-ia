// src/transporte.js — escolhe o transporte (Evolution ou Meta) por cliente.
//
// Objetivo: o server.js chama SEMPRE transporte.*(client, ...) e não precisa
// saber qual provider é. O cutover é a coluna clients.provider ('evolution'|'meta').
//
// Uso no server.js (função responder):
//   const transporte = require("./transporte");
//   await transporte.mostrarDigitando(client, contactPhone, Math.min(espera, 3000));
//   await transporte.enviarTexto(client, contactPhone, texto);

const evo = require("./evolution");
const meta = require("./meta");

function ehMeta(client) {
  return !!client && client.provider === "meta";
}

async function enviarTexto(client, number, text) {
  if (ehMeta(client)) return meta.enviarTexto(client, number, text);
  // Evolution usa a instância como chave (assinatura original: instance, number, text).
  return evo.enviarTexto(client.evolution_instance, number, text);
}

async function mostrarDigitando(client, number, ms) {
  if (ehMeta(client)) return meta.mostrarDigitando(client, number, ms);
  return evo.mostrarDigitando(client.evolution_instance, number, ms);
}

module.exports = { enviarTexto, mostrarDigitando };
