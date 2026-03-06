"use client";

import { createPortal } from "react-dom";
import { type CSSProperties } from "react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { defaultLetterColor, normalizeLetterColor, type Letter } from "@/app/lib/letters-shared";

const confettiPattern = Array.from({ length: 34 }, (_, index) => {
  const seedA = (index * 37 + 13) % 100;
  const seedB = (index * 53 + 29) % 100;
  const startX = ((seedA / 100) * 110 - 55).toFixed(2);
  const spreadX = ((seedB / 100) * 520 - 260).toFixed(2);
  const lift = -72 - ((index * 53) % 96);
  const delay = (index * 37) % 480;
  const rotate = 420 + ((index * 83) % 540);
  const size = 6 + ((index * 7) % 6);
  const fallDistance = 74 + ((index * 19) % 24);

  return { startX, spreadX, lift, delay, rotate, size, fallDistance };
});

const emptyDraft = {
  title: "",
  description: "",
  author: "",
  heading: "",
  paragraphOne: "",
  paragraphTwo: "",
  color: defaultLetterColor,
};

const letterColorOptions = [
  {
    key: "cream",
    label: "Crema",
    paper: "#faf4e8",
    ink: "#2c2419",
    border: "#d8c8ad",
    accent: "#e7bb7d",
    cardTop: "#2a2520",
    cardBottom: "#1a1714",
    glow: "rgba(231, 187, 125, 0.35)",
    titleTint: "#ffe7c4",
    iconPaper: "#faf4e8",
    iconLine: "#beaa8b",
    iconAuthor: "#8b6946",
  },
  {
    key: "rose",
    label: "Rosa",
    paper: "#ffe9ee",
    ink: "#43222e",
    border: "#e4adba",
    accent: "#f2839f",
    cardTop: "#2f1f2a",
    cardBottom: "#1b141a",
    glow: "rgba(242, 131, 159, 0.35)",
    titleTint: "#ffd5e2",
    iconPaper: "#ffe9ee",
    iconLine: "#cd93a2",
    iconAuthor: "#9b4f6a",
  },
  {
    key: "peach",
    label: "Durazno",
    paper: "#ffeedd",
    ink: "#3f2a1e",
    border: "#e3b992",
    accent: "#f1a35f",
    cardTop: "#332418",
    cardBottom: "#1d1510",
    glow: "rgba(241, 163, 95, 0.35)",
    titleTint: "#ffe0bf",
    iconPaper: "#ffeedd",
    iconLine: "#cf9f71",
    iconAuthor: "#a5672c",
  },
  {
    key: "mint",
    label: "Menta",
    paper: "#e8fff4",
    ink: "#1f3c33",
    border: "#a8dcc6",
    accent: "#4fd3a1",
    cardTop: "#1f2f2a",
    cardBottom: "#141c19",
    glow: "rgba(79, 211, 161, 0.35)",
    titleTint: "#d5ffea",
    iconPaper: "#e8fff4",
    iconLine: "#88c6ac",
    iconAuthor: "#3f8e6d",
  },
  {
    key: "sky",
    label: "Cielo",
    paper: "#eaf4ff",
    ink: "#1f3147",
    border: "#aac6ea",
    accent: "#5aa8ff",
    cardTop: "#1c2a38",
    cardBottom: "#131a22",
    glow: "rgba(90, 168, 255, 0.35)",
    titleTint: "#d9ecff",
    iconPaper: "#eaf4ff",
    iconLine: "#8caed8",
    iconAuthor: "#3f6ea6",
  },
  {
    key: "lavender",
    label: "Lavanda",
    paper: "#f3ecff",
    ink: "#2d2451",
    border: "#c7b3ea",
    accent: "#9d79e8",
    cardTop: "#271f36",
    cardBottom: "#16121f",
    glow: "rgba(157, 121, 232, 0.35)",
    titleTint: "#e7dcff",
    iconPaper: "#f3ecff",
    iconLine: "#ad98d2",
    iconAuthor: "#7355b3",
  },
  {
    key: "sun",
    label: "Sol",
    paper: "#fff6d8",
    ink: "#4a390f",
    border: "#e8cd7f",
    accent: "#f3c445",
    cardTop: "#322b17",
    cardBottom: "#1d190f",
    glow: "rgba(243, 196, 69, 0.35)",
    titleTint: "#fff0b8",
    iconPaper: "#fff6d8",
    iconLine: "#d1b26d",
    iconAuthor: "#a67d1f",
  },
  {
    key: "sand",
    label: "Arena",
    paper: "#f6f0e4",
    ink: "#352d22",
    border: "#d7c7aa",
    accent: "#d1a16b",
    cardTop: "#2b241b",
    cardBottom: "#18140f",
    glow: "rgba(209, 161, 107, 0.35)",
    titleTint: "#f9e4c9",
    iconPaper: "#f6f0e4",
    iconLine: "#b9a487",
    iconAuthor: "#8c6542",
  },
  {
    key: "slate",
    label: "Pizarra",
    paper: "#e9edf2",
    ink: "#1f2a36",
    border: "#afbccb",
    accent: "#7f9dbc",
    cardTop: "#222a32",
    cardBottom: "#161b20",
    glow: "rgba(127, 157, 188, 0.35)",
    titleTint: "#dbe5ef",
    iconPaper: "#e9edf2",
    iconLine: "#98abbd",
    iconAuthor: "#4f6780",
  },
  {
    key: "blush",
    label: "Rubor",
    paper: "#fff0f5",
    ink: "#442631",
    border: "#e5b8c8",
    accent: "#ef8eb0",
    cardTop: "#2f2028",
    cardBottom: "#1b1418",
    glow: "rgba(239, 142, 176, 0.35)",
    titleTint: "#ffd9e7",
    iconPaper: "#fff0f5",
    iconLine: "#ce9eb0",
    iconAuthor: "#a55478",
  },
] as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toRichHtml(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return escapeHtml(trimmed).replaceAll("\n", "<br>");
}

function sanitizeRichText(inputHtml: string) {
  if (typeof window === "undefined" || !inputHtml.trim()) {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(inputHtml, "text/html");
  const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "BR", "P", "DIV"]);

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const element = child as HTMLElement;

      if (!allowedTags.has(element.tagName)) {
        const fragment = doc.createDocumentFragment();

        while (element.firstChild) {
          fragment.appendChild(element.firstChild);
        }

        element.replaceWith(fragment);
        walk(node);
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        element.removeAttribute(attribute.name);
      }

      walk(element);
    }
  };

  walk(doc.body);
  return doc.body.innerHTML.trim();
}

export default function SobresPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [openedLetterId, setOpenedLetterId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);

  const openedLetter = useMemo(
    () => letters.find((letter) => letter.id === openedLetterId),
    [letters, openedLetterId],
  );

  const formTitle = editingLetterId ? "Editar carta" : "Agregar carta";

  const getLetterColorOption = (color?: string) => {
    const key = normalizeLetterColor(color);
    return letterColorOptions.find((option) => option.key === key) ?? letterColorOptions[0];
  };

  const openedLetterColor = useMemo(() => {
    return getLetterColorOption(openedLetter?.color);
  }, [openedLetter?.color]);

  const openedLetterHtml = useMemo(() => {
    if (!openedLetter) {
      return "";
    }

    const mergedBody = [openedLetter.paragraphOne, openedLetter.paragraphTwo].filter(Boolean).join("\n\n");
    return sanitizeRichText(toRichHtml(mergedBody));
  }, [openedLetter]);

  const loadLetters = async (preferredSelectedId?: string) => {
    setIsLoading(true);
    setDbError("");

    try {
      const response = await fetch("/api/letters", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las cartas.");
      }

      const data = (await response.json()) as { letters: Letter[] };
      const nextLetters = data.letters.map((letter) => ({
        ...letter,
        color: normalizeLetterColor(letter.color),
      }));

      setLetters(nextLetters);
      setOpenedLetterId((currentOpenedId) => {
        if (
          preferredSelectedId &&
          nextLetters.some((letter) => letter.id === preferredSelectedId)
        ) {
          return preferredSelectedId;
        }

        if (currentOpenedId && nextLetters.some((letter) => letter.id === currentOpenedId)) {
          return currentOpenedId;
        }

        return null;
      });
    } catch {
      setDbError("No se pudo conectar con la base de datos de cartas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLetters();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!openedLetter) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedLetterId(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openedLetter]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== draft.paragraphOne) {
      editorRef.current.innerHTML = draft.paragraphOne;
    }
  }, [draft.paragraphOne, editingLetterId]);

  const runEditorCommand = (command: "bold" | "italic" | "underline") => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command);

    setDraft((currentDraft) => ({
      ...currentDraft,
      paragraphOne: sanitizeRichText(editorRef.current?.innerHTML ?? ""),
    }));
  };

  const handleEditorInput = () => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      paragraphOne: sanitizeRichText(editorRef.current?.innerHTML ?? ""),
    }));
  };

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingLetterId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.author.trim()) {
      return;
    }

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      author: draft.author.trim(),
      heading: draft.heading.trim() || draft.title.trim(),
      paragraphOne: sanitizeRichText(draft.paragraphOne),
      paragraphTwo: "",
      color: normalizeLetterColor(draft.color),
    };

    setDbError("");

    if (editingLetterId) {
      const response = await fetch(`/api/letters/${editingLetterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setDbError("No se pudo actualizar la carta.");
        return;
      }

      await loadLetters(editingLetterId);
      resetDraft();
      return;
    }

    const response = await fetch("/api/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setDbError("No se pudo agregar la carta.");
      return;
    }

    const data = (await response.json()) as { letter: Letter };
    await loadLetters(data.letter.id);
    resetDraft();
  };

  const handleEdit = (letter: Letter) => {
    setEditingLetterId(letter.id);
    setDraft({
      title: letter.title,
      description: letter.description,
      author: letter.author,
      heading: letter.heading,
      paragraphOne: letter.paragraphOne,
      paragraphTwo: "",
      color: normalizeLetterColor(letter.color),
    });
  };

  const handleDelete = async (letterId: string) => {
    setDbError("");

    const response = await fetch(`/api/letters/${letterId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setDbError("No se pudo eliminar la carta.");
      return;
    }

    if (editingLetterId === letterId) {
      resetDraft();
    }

    await loadLetters();
  };

  return (
    <main className="envelopes-screen">
      <div className="envelopes-neon-lights" aria-hidden>
        <span className="neon-bar neon-bar-left neon-orange" />
        <span className="neon-bar neon-bar-left neon-blue" />
        <span className="neon-bar neon-bar-left neon-purple" />
        <span className="neon-bar neon-bar-right neon-orange" />
        <span className="neon-bar neon-bar-right neon-purple" />
        <span className="neon-bar neon-bar-right neon-blue" />
      </div>

      <section className="envelopes-wrap">
        <div className="envelopes-heading-row">
          <h1 className="envelopes-title">¡Es hora de ver tus cartas, Osiris!</h1>
          <button
            type="button"
            className={`envelope-manage-toggle ${isManaging ? "is-active" : ""}`}
            onClick={() => setIsManaging((current) => !current)}
            aria-expanded={isManaging}
          >
            Manejar cartas ✨
          </button>
        </div>

        {isLoading && <p className="envelope-db-message">Cargando cartas desde la base de datos...</p>}
        {dbError && <p className="envelope-db-error">{dbError}</p>}

        <div className="envelopes-grid">
          {letters.map((letter) => {
            const cardColor = getLetterColorOption(letter.color);

            return (
              <button
                key={letter.id}
                type="button"
                className="envelope-card envelope-card-button"
                style={
                  {
                    "--letter-card-border": cardColor.accent,
                    "--letter-card-border-strong": cardColor.accent,
                    "--letter-card-bg-top": cardColor.cardTop,
                    "--letter-card-bg-bottom": cardColor.cardBottom,
                    "--letter-card-glow": cardColor.glow,
                    "--letter-title-tint": cardColor.titleTint,
                    "--letter-icon-paper": cardColor.iconPaper,
                    "--letter-icon-line": cardColor.iconLine,
                    "--letter-icon-author": cardColor.iconAuthor,
                  } as CSSProperties
                }
                onClick={() => setOpenedLetterId(letter.id)}
              >
                <span
                  className="envelope-color-dot"
                  style={{
                    backgroundColor: cardColor.paper,
                    borderColor: cardColor.accent,
                  }}
                  aria-hidden
                />
                <h2 className="envelope-title">{letter.title}</h2>

              <div className="paper-preview" aria-hidden>
                <div className="paper-sheet">
                  <span className="paper-line" />
                  <span className="paper-line" />
                  <span className="paper-line short" />
                  <span className="paper-line" />
                  <span className="paper-line short" />
                  <p className="paper-author">Atte. {letter.author}</p>
                </div>

                <div className="card-confetti" aria-hidden>
                  {confettiPattern.map((piece, index) => (
                    <span
                      key={`${letter.id}-confetti-${index}`}
                      className="card-confetti-piece"
                      style={
                        {
                          "--spread-x": `${piece.spreadX}px`,
                          "--start-x": `${piece.startX}px`,
                          "--lift": `${piece.lift}px`,
                          "--delay": `${piece.delay}ms`,
                          "--fall-rotate": `${piece.rotate}deg`,
                          "--size": `${piece.size}px`,
                          "--fall-distance": `${piece.fallDistance}vh`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              </div>

                <p>{letter.description}</p>
              </button>
            );
          })}
        </div>

        {isClient &&
          openedLetter &&
          createPortal(
            <div
              className="letter-modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={openedLetter.heading}
              onClick={() => setOpenedLetterId(null)}
            >
              <article
                className="letter-sheet envelopes-letter-sheet letter-modal-sheet"
                style={{
                  backgroundColor: openedLetterColor.paper,
                  color: openedLetterColor.ink,
                  "--letter-paper-border": openedLetterColor.border,
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="letter-modal-close"
                  onClick={() => setOpenedLetterId(null)}
                  aria-label="Cerrar carta"
                >
                  X
                </button>
                <h2>{openedLetter.heading}</h2>
                <div
                  className="letter-rich-body"
                  dangerouslySetInnerHTML={{ __html: openedLetterHtml }}
                />
                <p className="letter-author-sign">Atte. {openedLetter.author}</p>
              </article>
            </div>,
            document.body,
          )}

        {isManaging && (
          <section className="letters-manager" aria-label="Manejar cartas">
            <div className="letters-manager-top">
              <h2>Manejar cartas</h2>
              <button type="button" className="manager-secondary-button" onClick={resetDraft}>
                Nueva
              </button>
            </div>

            <div className="letters-manager-grid">
              <div className="letters-manager-list">
                {letters.map((letter) => (
                  <article key={`manage-${letter.id}`} className="manager-item">
                    <p className="manager-item-title">{letter.title}</p>
                    <p className="manager-item-subtitle">Autor: {letter.author}</p>
                    <div className="manager-item-actions">
                      <button
                        type="button"
                        className="manager-secondary-button"
                        onClick={() => handleEdit(letter)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="manager-danger-button"
                        onClick={() => void handleDelete(letter.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <form className="letters-manager-form" onSubmit={(event) => void handleSubmit(event)}>
                <h3>{formTitle}</h3>

                <label>
                  Título
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Descripción corta
                  <input
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Autor
                  <input
                    value={draft.author}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, author: event.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Encabezado de la carta
                  <input
                    value={draft.heading}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, heading: event.target.value }))
                    }
                  />
                </label>

                <label>
                  Contenido de la carta
                  <div className="letter-editor-toolbar" role="toolbar" aria-label="Formato de texto">
                    <button
                      type="button"
                      className="manager-secondary-button editor-button"
                      onClick={() => runEditorCommand("bold")}
                    >
                      Negrita
                    </button>
                    <button
                      type="button"
                      className="manager-secondary-button editor-button"
                      onClick={() => runEditorCommand("italic")}
                    >
                      Itálica
                    </button>
                    <button
                      type="button"
                      className="manager-secondary-button editor-button"
                      onClick={() => runEditorCommand("underline")}
                    >
                      Subrayado
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    className="letter-rich-editor"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    aria-label="Editor de contenido de carta"
                  />
                </label>

                <fieldset className="letter-color-picker">
                  <legend>Color de la carta</legend>
                  <div className="letter-color-options">
                    {letterColorOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`letter-color-option ${
                          normalizeLetterColor(draft.color) === option.key ? "is-selected" : ""
                        }`}
                        onClick={() =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            color: option.key,
                          }))
                        }
                        aria-label={`Color ${option.label}`}
                        aria-pressed={normalizeLetterColor(draft.color) === option.key}
                      >
                        <span
                          className="letter-color-swatch"
                          style={{
                            backgroundColor: option.paper,
                            borderColor: option.border,
                          }}
                        />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <button type="submit" className="manager-primary-button">
                  {editingLetterId ? "Guardar cambios" : "Agregar carta"}
                </button>
              </form>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
