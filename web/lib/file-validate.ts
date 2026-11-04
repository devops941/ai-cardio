// Upload validation shared by the web layer (Section 9.8).

import { AppError } from "@/lib/errors";

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".xlsx",
  ".xls",
  ".csv",
  ".txt",
  ".md",
] as const;

export const TABULAR_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;

export function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}

export function maxUploadBytes(): number {
  return Number(process.env.MAX_UPLOAD_MB ?? 20) * 1024 * 1024;
}

export function validateFileMeta(
  filename: string,
  sizeBytes: number,
  options: { tabularOnly?: boolean } = {},
): string {
  const ext = extensionOf(filename);
  if (!ALLOWED_EXTENSIONS.includes(ext as never)) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      `File type '${ext || "unknown"}' is not allowed.`,
      415,
    );
  }
  if (
    options.tabularOnly &&
    !TABULAR_EXTENSIONS.includes(ext as never)
  ) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "Only .xlsx, .xls and .csv files are accepted here.",
      415,
    );
  }
  if (sizeBytes > maxUploadBytes()) {
    throw new AppError(
      "FILE_TOO_LARGE",
      `File is larger than ${process.env.MAX_UPLOAD_MB ?? 20} MB.`,
      413,
    );
  }
  if (sizeBytes === 0) {
    throw new AppError("FILE_SIGNATURE_MISMATCH", "File is empty.", 415);
  }
  return ext;
}

export async function checksumOf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04
const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

function startsWith(bytes: Uint8Array, magic: number[]): boolean {
  return magic.every((byte, i) => bytes[i] === byte);
}

export async function validateFileSignature(file: File): Promise<string> {
  const ext = extensionOf(file.name);
  const head = new Uint8Array(await file.slice(0, 8192).arrayBuffer());
  let ok: boolean;
  if (ext === ".pdf") {
    ok = startsWith(head, PDF_MAGIC);
  } else if (ext === ".docx" || ext === ".xlsx") {
    ok = startsWith(head, ZIP_MAGIC);
  } else if (ext === ".doc" || ext === ".xls") {
    ok = startsWith(head, OLE_MAGIC);
  } else {
    ok = !head.includes(0);
  }
  if (!ok) {
    throw new AppError(
      "FILE_SIGNATURE_MISMATCH",
      "The file content does not match its extension.",
      415,
    );
  }
  return ext;
}
