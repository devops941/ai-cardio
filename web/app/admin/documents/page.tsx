"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, RefreshCw, Trash2, UploadCloud } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmpty, AdminTable, AdminTableCard } from "@/components/admin/admin-table";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface DocumentRow {
  id: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  status: string;
  chunkCount: number;
  errorMessage: string | null;
  createdAt: string;
}

const STATUS_TONE: Record<string, "green" | "amber" | "cardiac" | "slate"> = {
  READY: "green",
  PROCESSING: "amber",
  PENDING: "slate",
  FAILED: "cardiac",
};

const FILE_TYPE_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/csv": "CSV",
  "text/plain": "TXT",
  "text/markdown": "MD",
};

function fileTypeLabel(fileType: string, fileName: string): string {
  const mapped = FILE_TYPE_LABEL[fileType];
  if (mapped) return mapped;
  const ext = fileName.split(".").pop();
  return ext ? ext.toUpperCase() : fileType;
}

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<DocumentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: DocumentRow[] }>("/api/admin/documents");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!items?.some((row) => row.status === "PROCESSING" || row.status === "PENDING")) return;
    const timer = setInterval(() => void load(), 3000);
    return () => clearInterval(timer);
  }, [items, load]);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await apiFetch("/api/admin/documents", { method: "POST", body: form });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("fields.deleteConfirmDocument"))) return;
    try {
      await apiFetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      setItems((prev) => (prev ? prev.filter((row) => row.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FileText}
        title={t("admin.documents")}
        subtitle="Manage the cardiology knowledge base powering grounded RAG retrieval and citations."
        action={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t("admin.search")}
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UploadCloud className="h-4 w-4 text-[var(--cardiac-600)]" />
            {t("admin.upload")}
          </CardTitle>
          <p className="text-xs text-[var(--ink-500)]">
            Upload ACC/AHA or ESC clinical guidelines to expand the RAG semantic knowledge base
          </p>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) void upload(file);
            }}
            className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragging
                ? "border-[var(--cardiac-500)] bg-[var(--cardiac-50)]/70"
                : "border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 hover:border-[var(--cardiac-400)]"
            }`}
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--cardiac-600)] shadow-sm">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-[var(--ink-900)]">
              Drag and drop a clinical reference document, or browse files
            </p>
            <p className="mt-1 text-[11px] text-[var(--ink-500)]">
              Supported: PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, MD · Maximum size 20 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <Button
              className="mt-4"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <UploadCloud className="h-4 w-4" />
              {busy ? "Ingesting & chunking..." : t("admin.upload")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdminTableCard
        icon={FileText}
        title={t("admin.documents")}
        subtitle={`${items?.length ?? 0} ${t("fields.entries")}`}
      >
        {items === null ? (
          <Skeleton className="h-40 w-full" />
        ) : items.length === 0 ? (
          <AdminEmpty label={t("admin.noData")} />
        ) : (
          <AdminTable
            head={[
              t("fields.title"),
              t("fields.type"),
              t("fields.size"),
              t("fields.status"),
              t("fields.chunks"),
              t("fields.date"),
              t("fields.actions"),
            ]}
          >
            {items.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[var(--cardiac-50)]/40">
                <td className="px-4 py-3.5 font-semibold text-[var(--ink-900)]">{row.fileName}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/60 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-[var(--cardiac-700)]">
                    {fileTypeLabel(row.fileType, row.fileName)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[var(--ink-500)]">
                  {Math.round(row.sizeBytes / 1024)} KB
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={STATUS_TONE[row.status] ?? "slate"}>{row.status}</Badge>
                  {row.status === "FAILED" && row.errorMessage ? (
                    <p className="mt-1 text-[11px] text-[var(--cardiac-700)]">{row.errorMessage}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 font-semibold text-[var(--ink-900)]">
                  {row.chunkCount}
                </td>
                <td className="px-4 py-3.5 text-[var(--ink-500)]">
                  {new Date(row.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(row.id)}
                    className="h-8 w-8 p-0 text-[var(--ink-300)] hover:bg-[var(--cardiac-50)] hover:text-[var(--cardiac-600)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("admin.delete")}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminTableCard>
    </div>
  );
}
