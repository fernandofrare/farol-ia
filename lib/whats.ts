// Numero de WhatsApp de atendimento da Farol IA (unico ponto de verdade).
// Trocar aqui reflete em toda a landing e paginas internas.
export const WHATS = "5554994009947";

export const wa = (texto: string) =>
  `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;
