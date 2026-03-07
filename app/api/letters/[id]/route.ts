import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { normalizeLetterColor, type Letter } from "@/app/lib/letters-shared";
import { getDatabaseUrl } from "@/app/lib/db-url";
import { LetterRequestError, parseLetterRequest } from "@/app/lib/letters-request";

export const runtime = "nodejs";

function getSqlClient() {
  return neon(getDatabaseUrl());
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await parseLetterRequest(request);

    const title = body.title;
    const author = body.author;

    if (!title || !author) {
      return NextResponse.json(
        { error: "Título y autor son obligatorios." },
        { status: 400 },
      );
    }

    const updated: Letter = {
      id,
      title,
      description: body.description,
      author,
      heading: body.heading || title,
      paragraphOne: body.paragraphOne,
      paragraphTwo: body.paragraphTwo,
      color: normalizeLetterColor(body.color),
      attachmentPdf: body.attachmentPdf ?? "",
    };

    const sql = getSqlClient();

    await sql`
      UPDATE letters
      SET
        title = ${updated.title},
        description = ${updated.description},
        author = ${updated.author},
        heading = ${updated.heading},
        paragraph_one = ${updated.paragraphOne},
        paragraph_two = ${updated.paragraphTwo},
        color = ${updated.color},
        attachment_pdf = ${updated.attachmentPdf ?? ""},
        updated_at = NOW()
      WHERE id = ${id};
    `;

    return NextResponse.json({ letter: updated });
  } catch (error) {
    if (error instanceof LetterRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "No se pudo actualizar la carta." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const sql = getSqlClient();

    await sql`DELETE FROM letters WHERE id = ${id};`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo eliminar la carta." }, { status: 500 });
  }
}
