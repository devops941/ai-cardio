"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileUp, FileText, Trash2, UploadCloud } from "lucide-react";

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

const STATUS_TONE: Record<string, "slate" | "green" | "red" | "amber"> = {
  READY: "green",
  FAILED: "red",
  PROCESSING: "amber",
  PENDING: "slate",
};

export default function AdminDocumentsPage() {
  const [rows, setRows] = useState<DocumentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: DocumentRow[] }>("/api/admin/documents");
      setRows(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!rows?.some((row) => row.status === "PROCESSING" || row.status === "PENDING")) return;
    const timer = setInterval(() => void load(), 3000);
    return () => clearInterval(timer);
  }, [rows, load]);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await apiFetch("/api/admin/documents", { method: "POST", body: form });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("fields.deleteConfirmDocument"))) return;
    try {
      await apiFetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      setRows((prev) => (prev ? prev.filter((row) => row.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <FileUp className="h-4 w-4 text-rose-600" />
            {t("admin.upload")}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Upload clinical cardiology guidelines (ACC/AHA, ESC) to expand the RAG semantic knowledgebase
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
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragging ? "border-rose-500 bg-rose-50/60" : "border-slate-200 bg-slate-50/40 hover:border-rose-300"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-rose-600 mb-2">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Drag and drop clinical reference document, or browse files
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Supported formats: PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, MD · Maximum size 20 MB
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
              className="mt-4 gap-2 rounded-xl"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? "Ingesting & Chunking..." : t("admin.upload")}
            </Button>
          </div>
          {error ? <Alert tone="error" className="mt-3">{error}</Alert> : null}
        </CardContent>
      </Card>

      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <FileText className="h-4 w-4 text-rose-600" />
            {t("admin.documents")}
          </CardTitle>
          <p className="text-xs text-slate-500">Indexed clinical publications and guideline corpora</p>
        </CardHeader>
        <CardContent>
          {rows === null ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : rows.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 font-semibold text-slate-700 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t("fields.title")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.type")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.size")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.status")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.chunks")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.date")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.fileName}</td>
                      <td className="px-4 py-3 font-mono text-[11px] uppercase">{row.fileType}</td>
                      <td className="px-4 py-3">{Math.round(row.sizeBytes / 1024)} KB</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[row.status] ?? "slate"}>{row.status}</Badge>
                        {row.status === "FAILED" && row.errorMessage ? (
                          <p className="mt-1 text-[11px] text-rose-700">{row.errorMessage}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{row.chunkCount}</td>
                      <td className="px-4 py-3">{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(row.id)}
                          className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">{t("admin.delete")}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
