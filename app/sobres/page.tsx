"use client";

import { type CSSProperties } from "react";
import { FormEvent, useMemo, useState } from "react";

type Letter = {
  id: string;
  title: string;
  description: string;
  author: string;
  heading: string;
  paragraphOne: string;
  paragraphTwo: string;
};

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

const initialLetters: Letter[] = [
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
  },
];

const emptyDraft = {
  title: "",
  description: "",
  author: "",
  heading: "",
  paragraphOne: "",
  paragraphTwo: "",
};

function createLetterId(title: string) {
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

export default function SobresPage() {
  const [letters, setLetters] = useState(initialLetters);
  const [selectedLetterId, setSelectedLetterId] = useState(initialLetters[0]?.id ?? "");
  const [isManaging, setIsManaging] = useState(false);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const selectedLetter = useMemo(
    () => letters.find((letter) => letter.id === selectedLetterId),
    [letters, selectedLetterId],
  );

  const formTitle = editingLetterId ? "Editar carta" : "Agregar carta";

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingLetterId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.author.trim()) {
      return;
    }

    if (editingLetterId) {
      setLetters((currentLetters) =>
        currentLetters.map((letter) =>
          letter.id === editingLetterId
            ? {
                ...letter,
                ...draft,
                title: draft.title.trim(),
                author: draft.author.trim(),
              }
            : letter,
        ),
      );
      resetDraft();
      return;
    }

    const newLetter: Letter = {
      id: createLetterId(draft.title),
      title: draft.title.trim(),
      description: draft.description.trim(),
      author: draft.author.trim(),
      heading: draft.heading.trim() || draft.title.trim(),
      paragraphOne: draft.paragraphOne.trim(),
      paragraphTwo: draft.paragraphTwo.trim(),
    };

    setLetters((currentLetters) => [...currentLetters, newLetter]);
    setSelectedLetterId(newLetter.id);
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
      paragraphTwo: letter.paragraphTwo,
    });
  };

  const handleDelete = (letterId: string) => {
    setLetters((currentLetters) => {
      const nextLetters = currentLetters.filter((letter) => letter.id !== letterId);

      if (!nextLetters.some((letter) => letter.id === selectedLetterId)) {
        setSelectedLetterId(nextLetters[0]?.id ?? "");
      }

      if (editingLetterId === letterId) {
        resetDraft();
      }

      return nextLetters;
    });
  };

  return (
    <main className="envelopes-screen">
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

        <div className="envelopes-grid">
          {letters.map((letter) => (
            <button
              key={letter.id}
              type="button"
              className="envelope-card envelope-card-button"
              onClick={() => setSelectedLetterId(letter.id)}
            >
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
          ))}
        </div>

        {selectedLetter && (
          <article className="letter-sheet envelopes-letter-sheet">
            <h2>{selectedLetter.heading}</h2>
            <p>{selectedLetter.paragraphOne}</p>
            <p>{selectedLetter.paragraphTwo}</p>
            <p className="letter-author-sign">Atte. {selectedLetter.author}</p>
          </article>
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
                        onClick={() => handleDelete(letter.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <form className="letters-manager-form" onSubmit={handleSubmit}>
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
                  Párrafo 1
                  <textarea
                    value={draft.paragraphOne}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        paragraphOne: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Párrafo 2
                  <textarea
                    value={draft.paragraphTwo}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        paragraphTwo: event.target.value,
                      }))
                    }
                  />
                </label>

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
