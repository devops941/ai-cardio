"use client";

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
        <CardTitle>
          {t("admin.bulkImport")} · {entity}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/templates/${templateBase}.csv`} download>
              {t("admin.downloadTemplate")} (CSV)
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/templates/${templateBase}.xlsx`} download>
              {t("admin.downloadTemplate")} (XLSX)
            </a>
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
          className="block w-full text-sm"
        />
        {busy ? <p className="text-sm text-slate-600">{t("fields.importing")}</p> : null}
        {error ? <Alert tone="error">{error}</Alert> : null}
        {result ? (
          <div className="space-y-2">
            <Alert tone={result.rejected.length > 0 ? "warning" : "success"}>
              {result.inserted} {t("admin.imported")}, {result.rejected.length} {t("admin.rejected")} (of {result.total})
            </Alert>
            {result.rejected.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="px-3 py-2">{t("admin.row")}</th>
                      <th scope="col" className="px-3 py-2">{t("admin.reason")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rejected.map((row) => (
                      <tr key={row.row} className="border-t border-slate-100">
                        <td className="px-3 py-2">{row.row}</td>
                        <td className="px-3 py-2">{row.reason}</td>
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
