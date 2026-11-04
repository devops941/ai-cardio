import { describe, expect, it } from "vitest";

import {
  validateFileMeta,
  validateFileSignature,
  extensionOf,
} from "@/lib/file-validate";
import { AppError } from "@/lib/errors";

function fileOf(name: string, bytes: number[]): File {
  return new File([new Uint8Array(bytes)], name);
}

describe("validateFileMeta", () => {
  it("rejects an unsupported extension with 415", () => {
    try {
      validateFileMeta("malware.exe", 10);
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).status).toBe(415);
      expect((err as AppError).code).toBe("UNSUPPORTED_FILE_TYPE");
    }
  });

  it("rejects a file above the size limit with 413", () => {
    try {
      validateFileMeta("big.pdf", 21 * 1024 * 1024);
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AppError).status).toBe(413);
      expect((err as AppError).code).toBe("FILE_TOO_LARGE");
    }
  });

  it("rejects tabular-only uploads of prose files", () => {
    try {
      validateFileMeta("notes.md", 10, { tabularOnly: true });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AppError).status).toBe(415);
    }
  });

  it("accepts an allowed extension and returns it", () => {
    expect(validateFileMeta("report.pdf", 10)).toBe(".pdf");
    expect(extensionOf("REPORT.PDF")).toBe(".pdf");
  });
});

describe("validateFileSignature", () => {
  it("accepts a real PDF header", async () => {
    await expect(
      validateFileSignature(fileOf("doc.pdf", [0x25, 0x50, 0x44, 0x46, 0x2d])),
    ).resolves.toBe(".pdf");
  });

  it("rejects text masquerading as a PDF with 415", async () => {
    await expect(
      validateFileSignature(fileOf("fake.pdf", [0x68, 0x65, 0x6c, 0x6c, 0x6f])),
    ).rejects.toMatchObject({ code: "FILE_SIGNATURE_MISMATCH", status: 415 });
  });

  it("accepts a zip-based docx and rejects a wrong magic", async () => {
    await expect(
      validateFileSignature(fileOf("doc.docx", [0x50, 0x4b, 0x03, 0x04])),
    ).resolves.toBe(".docx");
    await expect(
      validateFileSignature(fileOf("doc.docx", [0x50, 0x4b, 0x05, 0x06])),
    ).rejects.toMatchObject({ code: "FILE_SIGNATURE_MISMATCH" });
  });

  it("accepts an OLE xls and rejects NUL bytes in text", async () => {
    await expect(
      validateFileSignature(
        fileOf("legacy.xls", [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
      ),
    ).resolves.toBe(".xls");
    await expect(
      validateFileSignature(fileOf("notes.txt", [0x61, 0x00, 0x62])),
    ).rejects.toMatchObject({ code: "FILE_SIGNATURE_MISMATCH" });
  });

  it("accepts plain text without NUL bytes", async () => {
    await expect(
      validateFileSignature(fileOf("notes.txt", [0x68, 0x69])),
    ).resolves.toBe(".txt");
  });
});
