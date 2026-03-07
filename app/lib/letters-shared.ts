export type Letter = {
  id: string;
  title: string;
  description: string;
  author: string;
  heading: string;
  paragraphOne: string;
  paragraphTwo: string;
  color: string;
  attachmentPdf?: string;
};

export const letterColorKeys = [
  "cream",
  "rose",
  "peach",
  "mint",
  "sky",
  "lavender",
  "sun",
  "sand",
  "slate",
  "blush",
] as const;

export const defaultLetterColor = "cream";

export function normalizeLetterColor(value?: string) {
  if (value && letterColorKeys.includes(value as (typeof letterColorKeys)[number])) {
    return value;
  }

  return defaultLetterColor;
}

export const defaultLetters: Letter[] = [
  {
    id: "carta-fiesta",
    title: "Carta para el día de la fiesta",
    description: "Ábrela cuando estén todos celebrando contigo.",
    author: "César",
    heading: "Carta para abrir en la fiesta 🎉",
    paragraphOne:
      "Si abriste esta carta, entonces llegó el gran momento: tu fiesta. Hoy la misión es simple: reír fuerte, abrazar a quienes quieres y guardar cada recuerdo como si fuera una canción favorita.",
    paragraphTwo:
      "Feliz cumpleaños, Osiris. Que esta noche tenga la energía de una gran historia y que cada detalle te recuerde lo importante que eres.",
    color: "peach",
    attachmentPdf: "",
  },
  {
    id: "carta-solo",
    title: "Carta para cuando estés solo",
    description: "Guárdala para un momento tranquilo solo para ti.",
    author: "César",
    heading: "Carta para cuando estés solo 🌙",
    paragraphOne:
      "Este es tu espacio tranquilo. Respira, mira todo lo que avanzaste y date crédito por cada paso que te trajo hasta aquí. También eso merece celebrarse.",
    paragraphTwo:
      "Feliz cumpleaños, Osiris. Ojalá que este nuevo año te regale paz, claridad y muchas razones para sonreír incluso en silencio.",
    color: "lavender",
    attachmentPdf: "",
  },
];

export function createLetterId(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug) {
    return `carta-${Date.now()}`;
  }

  return `${slug}-${Date.now()}`;
}
