"use client";

import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface ImportResult {
  inserted: number;
  rejected: { row: number; reason: string }[];
  total: number;
}

export function BulkImportCard({
  entity,
  endpoint,
  templateBase,
  onDone,
}: {
  entity: string;
  endpoint: string;
  templateBase: string;
  onDone?: () => void;
}) {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await apiFetch<ImportResult>(endpoint, { method: "POST", body: form });
      setResult(data);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="h-4 w-4 text-[var(--cardiac-600)]" />
          {t("admin.bulkImport")} · {entity}
        </CardTitle>
        <p className="text-xs text-[var(--ink-500)]">
          Batch ingest records via formatted CSV or Microsoft Excel spreadsheets
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={`/templates/${templateBase}.csv`} download className="gap-1.5">
              <Download className="h-3.5 w-3.5 text-[var(--cardiac-600)]" />
              {t("admin.downloadTemplate")} (CSV)
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={`/templates/${templateBase}.xlsx`} download className="gap-1.5">
              <Download className="h-3.5 w-3.5 text-[var(--cardiac-600)]" />
              {t("admin.downloadTemplate")} (XLSX)
            </a>
          </Button>
        </div>

        <label
          className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-4 transition-colors hover:border-[var(--cardiac-400)] hover:bg-[var(--cardiac-50)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--cardiac-600)] shadow-sm">
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold text-[var(--ink-700)]">
            Choose a CSV or Excel file to import
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="sr-only"
          />
        </label>

        {busy ? (
          <p className="animate-pulse text-xs text-[var(--ink-500)]">{t("fields.importing")}</p>
        ) : null}
        {error ? <Alert tone="error">{error}</Alert> : null}

        {result ? (
          <div className="space-y-3">
            <Alert tone={result.rejected.length > 0 ? "warning" : "success"}>
              {result.inserted} {t("admin.imported")}, {result.rejected.length} {t("admin.rejected")}{" "}
              (of {result.total})
            </Alert>
            {result.rejected.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-[var(--ink-100)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--cardiac-50)] text-[var(--ink-700)]">
                    <tr>
                      <th scope="col" className="px-3 py-2">{t("admin.row")}</th>
                      <th scope="col" className="px-3 py-2">{t("admin.reason")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rejected.map((row) => (
                      <tr key={row.row} className="border-t border-[var(--ink-100)]">
                        <td className="px-3 py-2 font-mono font-medium">{row.row}</td>
                        <td className="px-3 py-2 text-[var(--cardiac-700)]">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
