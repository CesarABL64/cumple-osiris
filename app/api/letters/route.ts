import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import {
  createLetterId,
  defaultLetters,
  normalizeLetterColor,
  type Letter,
} from "@/app/lib/letters-shared";
import { getDatabaseUrl } from "@/app/lib/db-url";

function buildErrorPayload(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return { error: message };
  }

  if (error instanceof Error) {
    return { error: message, detail: error.message };
  }

  return { error: message, detail: "Error desconocido" };
}

function getSqlClient() {
  return neon(getDatabaseUrl());
}

async function ensureLettersTable() {
  const sql = getSqlClient();

  await sql`
    CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL,
      heading TEXT NOT NULL,
      paragraph_one TEXT NOT NULL DEFAULT '',
      paragraph_two TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT 'cream',
      attachment_pdf TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE letters
    ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'cream';
  `;

  await sql`
    ALTER TABLE letters
    ADD COLUMN IF NOT EXISTS attachment_pdf TEXT NOT NULL DEFAULT '';
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

async function seedDefaultLettersOnce() {
  const sql = getSqlClient();

  const seedRows = await sql`
    SELECT value
    FROM app_meta
    WHERE key = 'letters_seeded_v1'
    LIMIT 1;
  `;

  if (seedRows.length > 0) {
    return;
  }

  const countRows = await sql`SELECT COUNT(*)::int AS count FROM letters;`;
  const count = Number(countRows[0]?.count ?? 0);

  if (count === 0) {
    for (const letter of defaultLetters) {
      await sql`
        INSERT INTO letters (id, title, description, author, heading, paragraph_one, paragraph_two, color, attachment_pdf)
        VALUES (
          ${letter.id},
          ${letter.title},
          ${letter.description},
          ${letter.author},
          ${letter.heading},
          ${letter.paragraphOne},
          ${letter.paragraphTwo},
          ${normalizeLetterColor(letter.color)},
          ${letter.attachmentPdf ?? ""}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  await sql`
    INSERT INTO app_meta (key, value)
    VALUES ('letters_seeded_v1', 'true')
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  `;
}

async function listLetters(): Promise<Letter[]> {
  const sql = getSqlClient();

  const rows = await sql`
    SELECT
      id,
      title,
      description,
      author,
      heading,
      paragraph_one AS "paragraphOne",
      paragraph_two AS "paragraphTwo",
      color,
      attachment_pdf AS "attachmentPdf"
    FROM letters
    ORDER BY created_at ASC;
  `;

  return rows as Letter[];
}

export async function GET() {
  try {
    await ensureLettersTable();
    await seedDefaultLettersOnce();

    const letters = await listLetters();
    return NextResponse.json({ letters });
  } catch (error) {
    console.error(error);
    return NextResponse.json(buildErrorPayload("No se pudieron obtener las cartas.", error), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    await ensureLettersTable();
    await seedDefaultLettersOnce();

    const body = (await request.json()) as Partial<Letter>;
    const title = body.title?.trim() ?? "";
    const author = body.author?.trim() ?? "";

    if (!title || !author) {
      return NextResponse.json(
        { error: "Título y autor son obligatorios." },
        { status: 400 },
      );
    }

    const letter: Letter = {
      id: createLetterId(title),
      title,
      description: body.description?.trim() ?? "",
      author,
      heading: body.heading?.trim() || title,
      paragraphOne: body.paragraphOne?.trim() ?? "",
      paragraphTwo: body.paragraphTwo?.trim() ?? "",
      color: normalizeLetterColor(body.color),
      attachmentPdf: body.attachmentPdf ?? "",
    };

    const sql = getSqlClient();

    await sql`
      INSERT INTO letters (id, title, description, author, heading, paragraph_one, paragraph_two, color, attachment_pdf)
      VALUES (
        ${letter.id},
        ${letter.title},
        ${letter.description},
        ${letter.author},
        ${letter.heading},
        ${letter.paragraphOne},
        ${letter.paragraphTwo},
        ${letter.color},
        ${letter.attachmentPdf ?? ""}
      );
    `;

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(buildErrorPayload("No se pudo crear la carta.", error), {
      status: 500,
    });
  }
}
