import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { getDatabaseUrl } from "@/app/lib/db-url";

type CommentRow = {
  id: number;
  comment: string;
  created_at: string;
};

function getSqlClient() {
  return neon(getDatabaseUrl());
}

async function ensureCommentsTable() {
  const sql = getSqlClient();

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id BIGSERIAL PRIMARY KEY,
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

async function createComment(formData: FormData) {
  "use server";

  const rawComment = formData.get("comment");
  const comment = typeof rawComment === "string" ? rawComment.trim() : "";

  if (!comment) {
    return;
  }

  const sql = getSqlClient();

  await ensureCommentsTable();
  await sql`INSERT INTO comments (comment) VALUES (${comment});`;

  revalidatePath("/comentarios");
}

async function getComments(): Promise<CommentRow[]> {
  const sql = getSqlClient();

  await ensureCommentsTable();

  const rows = await sql`
    SELECT id, comment, created_at
    FROM comments
    ORDER BY created_at DESC
    LIMIT 30;
  `;

  return rows as CommentRow[];
}

export default async function ComentariosPage() {
  let comments: CommentRow[] = [];
  let databaseError = "";

  try {
    comments = await getComments();
  } catch (error) {
    console.error(error);
    databaseError =
      "No se pudo conectar con la base de datos. Revisa DATABASE_URL en tu .env.development.local.";
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_14%,#1f1f35,#0a0a10_55%)] px-4 py-10 text-white">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-white/15 bg-black/25 p-6 backdrop-blur">
        <h1 className="text-3xl font-bold">Comentarios con Neon</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Esta pantalla usa Server Actions para insertar comentarios en Postgres.
        </p>

        <form action={createComment} className="mt-6 flex gap-2">
          <input
            type="text"
            name="comment"
            placeholder="Escribe un comentario"
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-zinc-400 outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-400"
          >
            Guardar
          </button>
        </form>

        {databaseError ? (
          <p className="mt-4 rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-200">
            {databaseError}
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {comments.length === 0 ? (
              <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-300">
                Aún no hay comentarios.
              </li>
            ) : (
              comments.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <p>{item.comment}</p>
                  <p className="mt-1 text-xs text-zinc-400">{new Date(item.created_at).toLocaleString("es-MX")}</p>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
