"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

const stages = [
  {
    title: "¡Hola, Osiris!",
    description: "Hoy quiero hacer que tu día sea especial :).",
    accent: "#22d3ee",
    background: "radial-gradient(circle at top right, #151429, #090915 56%, #05050b)",
  },
  {
    title: "¡Tu día merece brillar!",
    description: "Por ello, hicimos algo especial para ti.",
    accent: "#a855f7",
    background: "radial-gradient(circle at top right, #211739, #130a21 56%, #09050f)",
  },
  {
    title: "Esta historia va por etapas",
    description: "Como un Spotify Wrapped, pero con cariño para tu cumple.",
    accent: "#f43f5e",
    background: "radial-gradient(circle at top right, #35203a, #211126 56%, #120915)",
  },
  {
    title: "Prepárate para abrir tus cartas",
    description: "Entra y elige la carta para el momento perfecto.",
    accent: "#f59e0b",
    background: "radial-gradient(circle at top right, #4b2a2b, #2c1418 56%, #190d10)",
  },
];

const shapeStates = [
  {
    s1: { transform: "translate(0px, 0px) scale(1)", borderColor: "#22d3ee" },
    s2: { transform: "translate(0px, 0px) rotate(0deg)", borderColor: "#a855f7" },
    s3: { transform: "translate(0px, 0px) scale(1)", borderColor: "#f43f5e" },
    s4: { transform: "translate(0px, 0px) rotate(0deg)", borderColor: "#f59e0b" },
  },
  {
    s1: { transform: "translate(22px, -18px) scale(1.06)", borderColor: "#a855f7" },
    s2: { transform: "translate(-18px, 24px) rotate(16deg)", borderColor: "#22d3ee" },
    s3: { transform: "translate(10px, -24px) scale(0.95)", borderColor: "#f59e0b" },
    s4: { transform: "translate(-14px, 20px) rotate(-8deg)", borderColor: "#f43f5e" },
  },
  {
    s1: { transform: "translate(-25px, 14px) scale(0.96)", borderColor: "#f43f5e" },
    s2: { transform: "translate(26px, -20px) rotate(-14deg)", borderColor: "#f59e0b" },
    s3: { transform: "translate(-18px, 22px) scale(1.08)", borderColor: "#22d3ee" },
    s4: { transform: "translate(24px, -16px) rotate(11deg)", borderColor: "#a855f7" },
  },
  {
    s1: { transform: "translate(8px, -22px) scale(1.1)", borderColor: "#f59e0b" },
    s2: { transform: "translate(-22px, 14px) rotate(20deg)", borderColor: "#f43f5e" },
    s3: { transform: "translate(20px, -12px) scale(0.98)", borderColor: "#a855f7" },
    s4: { transform: "translate(-18px, 16px) rotate(-12deg)", borderColor: "#22d3ee" },
  },
];

const confettiPieces = Array.from({ length: 44 }).map((_, index) => ({
  id: `confetti-${index}`,
  left: (index * 17.37) % 100,
  delay: (index * 137) % 1400,
  duration: 2600 + ((index * 211) % 2200),
  drift: -20 + ((index * 29) % 40),
  rotate: 360 + ((index * 73) % 780),
  color:
    index % 5 === 0
      ? "#f59e0b"
      : index % 5 === 1
        ? "#ec4899"
        : index % 5 === 2
          ? "#22d3ee"
          : index % 5 === 3
            ? "#a855f7"
            : "#34d399",
}));

export default function Home() {
  const [stage, setStage] = useState(0);

  const currentStage = stages[stage];
  const isFinalStage = stage === stages.length - 1;
  const progress = useMemo(() => ((stage + 1) / stages.length) * 100, [stage]);
  const currentShapeState = shapeStates[stage];

  const goNext = () => {
    setStage((prev) => Math.min(prev + 1, stages.length - 1));
  };

  const goPrev = () => {
    setStage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <main className="intro-screen" style={{ background: currentStage.background }}>
      <div className="intro-shapes" aria-hidden>
        <div className="intro-shape shape-1" style={currentShapeState.s1} />
        <div className="intro-shape shape-2" style={currentShapeState.s2} />
        <div className="intro-shape shape-3" style={currentShapeState.s3} />
        <div className="intro-shape shape-4" style={currentShapeState.s4} />
      </div>

      {isFinalStage && (
        <div className="confetti-layer" aria-hidden>
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={
                {
                  left: `${piece.left}%`,
                  animationDelay: `${piece.delay}ms`,
                  animationDuration: `${piece.duration}ms`,
                  "--confetti-color": piece.color,
                  "--confetti-drift": `${piece.drift}px`,
                  "--confetti-rotate": `${piece.rotate}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <section className="intro-content">
        <h1 key={currentStage.title} className="intro-title fade-up">
          {currentStage.title}
        </h1>
        <p key={currentStage.description} className="intro-description fade-up">
          {currentStage.description}
        </p>

        <div className="intro-progress">
          <div
            className="intro-progress-bar"
            style={{ width: `${progress}%`, backgroundColor: currentStage.accent }}
          />
        </div>

        <div className="intro-controls">
          <button
            type="button"
            className="intro-control-button"
            onClick={goPrev}
            disabled={stage === 0}
          >
            Anterior
          </button>
          <button
            type="button"
            className="intro-control-button"
            onClick={goNext}
            disabled={isFinalStage}
          >
            Siguiente
          </button>
        </div>

        <Link
          href="/sobres"
          className={`intro-final-cta ${isFinalStage ? "is-visible" : "is-hidden"}`}
        >
          Ir a las cartas
        </Link>
      </section>
    </main>
  );
}
