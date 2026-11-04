"use client";

import { useCallback, useEffect, useState } from "react";

import { BulkImportCard } from "@/components/admin/bulk-import-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface HospitalRow {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  emergency24x7: boolean;
  hasCardiology: boolean;
  hasCathLab: boolean;
  rating: number;
  beds: number | null;
}

const EMPTY: Partial<HospitalRow> = { name: "", rating: 0 };

export default function AdminHospitalsPage() {
  const [rows, setRows] = useState<HospitalRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<HospitalRow> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: HospitalRow[] }>(
        `/api/admin/hospitals${query ? `?q=${encodeURIComponent(query)}` : ""}`,
      );
      setRows(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: draft.name ?? "",
        address: draft.address ?? "",
        city: draft.city ?? "",
        state: draft.state ?? "",
        pincode: draft.pincode ?? "",
        phone: draft.phone ?? "",
        latitude: draft.latitude ?? null,
        longitude: draft.longitude ?? null,
        emergency24x7: Boolean(draft.emergency24x7),
        hasCardiology: Boolean(draft.hasCardiology),
        hasCathLab: Boolean(draft.hasCathLab),
        rating: draft.rating ?? 0,
        beds: draft.beds ?? null,
      };
      if (draft.id) {
        await apiFetch(`/api/admin/hospitals/${draft.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/hospitals", { method: "POST", body: JSON.stringify(payload) });
      }
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("fields.deleteConfirmHospital"))) return;
    try {
      await apiFetch(`/api/admin/hospitals/${id}`, { method: "DELETE" });
      setRows((prev) => (prev ? prev.filter((row) => row.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }

  return (
    <div className="space-y-6">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.hospitals")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="q">{t("admin.search")}</Label>
              <Input id="q" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button onClick={() => setDraft({ ...EMPTY })}>{t("admin.add")}</Button>
          </div>

          {draft ? (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="h-name">{t("fields.name")}</Label>
                  <Input id="h-name" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-address">{t("fields.address")}</Label>
                  <Input id="h-address" value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-city">{t("fields.city")}</Label>
                  <Input id="h-city" value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-state">{t("fields.state")}</Label>
                  <Input id="h-state" value={draft.state ?? ""} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-pincode">{t("fields.pincode")}</Label>
                  <Input id="h-pincode" value={draft.pincode ?? ""} onChange={(e) => setDraft({ ...draft, pincode: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-phone">{t("fields.phone")}</Label>
                  <Input id="h-phone" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-lat">{t("fields.latitude")}</Label>
                  <Input
                    id="h-lat"
                    type="number"
                    step="any"
                    value={draft.latitude ?? ""}
                    onChange={(e) => setDraft({ ...draft, latitude: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-lng">{t("fields.longitude")}</Label>
                  <Input
                    id="h-lng"
                    type="number"
                    step="any"
                    value={draft.longitude ?? ""}
                    onChange={(e) => setDraft({ ...draft, longitude: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-rating">{t("fields.rating")}</Label>
                  <Input
                    id="h-rating"
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    value={draft.rating ?? 0}
                    onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-beds">{t("fields.beds")}</Label>
                  <Input
                    id="h-beds"
                    type="number"
                    value={draft.beds ?? ""}
                    onChange={(e) => setDraft({ ...draft, beds: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="h-em" checked={Boolean(draft.emergency24x7)} onChange={(e) => setDraft({ ...draft, emergency24x7: e.target.checked })} />
                  <Label htmlFor="h-em" className="font-normal">24×7 emergency</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="h-card" checked={Boolean(draft.hasCardiology)} onChange={(e) => setDraft({ ...draft, hasCardiology: e.target.checked })} />
                  <Label htmlFor="h-card" className="font-normal">{t("fields.cardiology")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="h-cath" checked={Boolean(draft.hasCathLab)} onChange={(e) => setDraft({ ...draft, hasCathLab: e.target.checked })} />
                  <Label htmlFor="h-cath" className="font-normal">{t("fields.cathLab")}</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>{t("admin.save")}</Button>
                <Button variant="ghost" onClick={() => setDraft(null)}>{t("admin.cancel")}</Button>
              </div>
            </div>
          ) : null}

          {rows === null ? (
            <Skeleton className="h-40 w-full" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-600">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t("fields.name")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.city")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.phone")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.rating")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.city ?? "—"}</td>
                      <td className="px-3 py-2">{row.phone ?? "—"}</td>
                      <td className="px-3 py-2">{row.rating}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setDraft(row)}>
                            {t("admin.edit")}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => remove(row.id)}>
                            {t("admin.delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkImportCard
        entity={t("admin.hospitals")}
        endpoint="/api/admin/hospitals/import"
        templateBase="hospitals_template"
        onDone={load}
      />
    </div>
  );
}
