"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.upload")}</CardTitle>
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
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center ${
              dragging ? "border-blue-500 bg-blue-50" : "border-slate-300"
            }`}
          >
            <p className="text-sm text-slate-700">
              Drag and drop a file here, or choose one.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              pdf docx doc xlsx xls csv txt md · up to 20 MB
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
            <Button className="mt-3" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : t("admin.upload")}
            </Button>
          </div>
          {error ? <Alert tone="error" className="mt-3">{error}</Alert> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.documents")}</CardTitle>
        </CardHeader>
        <CardContent>
          {rows === null ? (
            <Skeleton className="h-40 w-full" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-600">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t("fields.title")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.type")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.size")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.status")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.chunks")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.date")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.fileName}</td>
                      <td className="px-3 py-2">{row.fileType}</td>
                      <td className="px-3 py-2">{Math.round(row.sizeBytes / 1024)} KB</td>
                      <td className="px-3 py-2">
                        <Badge tone={STATUS_TONE[row.status] ?? "slate"}>{row.status}</Badge>
                        {row.status === "FAILED" && row.errorMessage ? (
                          <p className="mt-1 text-xs text-red-700">{row.errorMessage}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{row.chunkCount}</td>
                      <td className="px-3 py-2">{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        <Button variant="danger" size="sm" onClick={() => remove(row.id)}>
                          {t("admin.delete")}
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
