"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      setErrorMessage("Ingresa usuario y contraseña.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Error de inicio de sesión." }))) as {
        error?: string;
      };
      setErrorMessage(data.error ?? "Error de inicio de sesión.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <h1>Acceso Privado</h1>
        <p>Ingresa con tus credenciales para ver el sitio.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Usuario
            <input value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
