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
    paper: "#fff1cf",
    ink: "#2c2419",
    border: "#f2bf70",
    accent: "#ffb347",
    cardTop: "#3a2516",
    cardBottom: "#24160e",
    glow: "rgba(255, 179, 71, 0.5)",
    titleTint: "#ffe7bf",
    iconPaper: "#fff1cf",
    iconLine: "#f0ba66",
    iconAuthor: "#b56a1f",
  },
  {
    key: "rose",
    label: "Rosa",
    paper: "#ffd8e8",
    ink: "#43222e",
    border: "#ff8fb8",
    accent: "#ff5f9d",
    cardTop: "#3f1b31",
    cardBottom: "#261225",
    glow: "rgba(255, 95, 157, 0.48)",
    titleTint: "#ffc1dc",
    iconPaper: "#ffd8e8",
    iconLine: "#ff86b3",
    iconAuthor: "#b93874",
  },
  {
    key: "peach",
    label: "Durazno",
    paper: "#ffe2c8",
    ink: "#3f2a1e",
    border: "#ffad66",
    accent: "#ff8a3d",
    cardTop: "#3d210f",
    cardBottom: "#27160b",
    glow: "rgba(255, 138, 61, 0.5)",
    titleTint: "#ffd0ab",
    iconPaper: "#ffe2c8",
    iconLine: "#f89b47",
    iconAuthor: "#b35616",
  },
  {
    key: "mint",
    label: "Menta",
    paper: "#d4ffea",
    ink: "#1f3c33",
    border: "#5de2b2",
    accent: "#24c98a",
    cardTop: "#15352e",
    cardBottom: "#10231f",
    glow: "rgba(36, 201, 138, 0.46)",
    titleTint: "#bcffe0",
    iconPaper: "#d4ffea",
    iconLine: "#59cfaa",
    iconAuthor: "#1d8f68",
  },
  {
    key: "sky",
    label: "Cielo",
    paper: "#d8ecff",
    ink: "#1f3147",
    border: "#6fb2ff",
    accent: "#2f92ff",
    cardTop: "#142c48",
    cardBottom: "#101e33",
    glow: "rgba(47, 146, 255, 0.48)",
    titleTint: "#bfe0ff",
    iconPaper: "#d8ecff",
    iconLine: "#62a7f0",
    iconAuthor: "#2a6fc2",
  },
  {
    key: "lavender",
    label: "Lavanda",
    paper: "#e7dbff",
    ink: "#2d2451",
    border: "#b080ff",
    accent: "#9258ff",
    cardTop: "#28194a",
    cardBottom: "#1a1132",
    glow: "rgba(146, 88, 255, 0.48)",
    titleTint: "#d8c3ff",
    iconPaper: "#e7dbff",
    iconLine: "#a173ff",
    iconAuthor: "#6938c8",
  },
  {
    key: "sun",
    label: "Sol",
    paper: "#fff0b8",
    ink: "#4a390f",
    border: "#ffd05f",
    accent: "#ffb600",
    cardTop: "#3f2f0a",
    cardBottom: "#271d08",
    glow: "rgba(255, 182, 0, 0.5)",
    titleTint: "#ffe58d",
    iconPaper: "#fff0b8",
    iconLine: "#f4bd3a",
    iconAuthor: "#b27a00",
  },
  {
    key: "sand",
    label: "Arena",
    paper: "#fbe6c7",
    ink: "#352d22",
    border: "#e9ad63",
    accent: "#d9872f",
    cardTop: "#3b2815",
    cardBottom: "#25180f",
    glow: "rgba(217, 135, 47, 0.46)",
    titleTint: "#f6d3a3",
    iconPaper: "#fbe6c7",
    iconLine: "#e09b4f",
    iconAuthor: "#a55e15",
  },
  {
    key: "slate",
    label: "Pizarra",
    paper: "#d4e8ff",
    ink: "#1f2a36",
    border: "#72a7df",
    accent: "#4b8bd1",
    cardTop: "#1b2f44",
    cardBottom: "#142233",
    glow: "rgba(75, 139, 209, 0.42)",
    titleTint: "#c6ddfb",
    iconPaper: "#d4e8ff",
    iconLine: "#6e9fd5",
    iconAuthor: "#2f629a",
  },
  {
    key: "blush",
    label: "Rubor",
    paper: "#ffd9e7",
    ink: "#442631",
    border: "#ff93b8",
    accent: "#ff4d8a",
    cardTop: "#3b1830",
    cardBottom: "#251222",
    glow: "rgba(255, 77, 138, 0.48)",
    titleTint: "#ffc2d8",
    iconPaper: "#ffd9e7",
    iconLine: "#ff86b0",
    iconAuthor: "#b13769",
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
                style={
                  {
                    backgroundColor: openedLetterColor.paper,
                    color: openedLetterColor.ink,
                    "--letter-paper-border": openedLetterColor.border,
                  } as CSSProperties
                }
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
