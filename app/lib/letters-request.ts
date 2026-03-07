import { Buffer } from "node:buffer";
import type { Letter } from "@/app/lib/letters-shared";
import { allowedPdfMime, maxAttachmentBytes } from "@/app/lib/letters-attachment-config";

export class LetterRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function toTrimmedString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePdfFromField(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function validatePdfFile(file: File) {
  if (file.size > maxAttachmentBytes) {
    throw new LetterRequestError(
      "El PDF es demasiado grande. El tamaño máximo permitido es 4 MB.",
      413,
    );
  }

  const isPdfMime = file.type === allowedPdfMime;
  const isPdfName = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfName) {
    throw new LetterRequestError("Solo se permiten archivos PDF.", 400);
  }
}

async function toPdfDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || allowedPdfMime;

  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

function normalizeJsonBody(body: Partial<Letter>) {
  return {
    title: body.title?.trim() ?? "",
    description: body.description?.trim() ?? "",
    author: body.author?.trim() ?? "",
    heading: body.heading?.trim() ?? "",
    paragraphOne: body.paragraphOne?.trim() ?? "",
    paragraphTwo: body.paragraphTwo?.trim() ?? "",
    color: body.color,
    attachmentPdf: body.attachmentPdf ?? "",
  };
}

async function normalizeMultipartBody(formData: FormData) {
  const fileField = formData.get("attachmentPdfFile");
  const attachmentField = formData.get("attachmentPdf");

  let attachmentPdf = normalizePdfFromField(attachmentField);

  if (fileField instanceof File && fileField.size > 0) {
    validatePdfFile(fileField);
    attachmentPdf = await toPdfDataUrl(fileField);
  }

  return {
    title: toTrimmedString(formData.get("title")),
    description: toTrimmedString(formData.get("description")),
    author: toTrimmedString(formData.get("author")),
    heading: toTrimmedString(formData.get("heading")),
    paragraphOne: toTrimmedString(formData.get("paragraphOne")),
    paragraphTwo: toTrimmedString(formData.get("paragraphTwo")),
    color: toTrimmedString(formData.get("color")),
    attachmentPdf,
  };
}

export async function parseLetterRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return normalizeMultipartBody(formData);
  }

  if (contentType.includes("application/json") || !contentType) {
    const body = (await request.json()) as Partial<Letter>;
    return normalizeJsonBody(body);
  }

  throw new LetterRequestError("Formato de solicitud no soportado.", 415);
}
