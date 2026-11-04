"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";

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

      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Building2 className="h-4 w-4 text-rose-600" />
            {t("admin.hospitals")}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Manage certified cardiology health centers, emergency facilities, and cath labs
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Input
                id="q"
                placeholder="Search by hospital name or city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            <Button onClick={() => setDraft({ ...EMPTY })} size="sm" className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" />
              {t("admin.add")}
            </Button>
          </div>

          {draft ? (
            <div className="space-y-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                {draft.id ? "Edit Cardiac Facility" : "Add New Cardiac Facility"}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="h-name" className="text-xs">{t("fields.name")}</Label>
                  <Input id="h-name" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-address" className="text-xs">{t("fields.address")}</Label>
                  <Input id="h-address" value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-city" className="text-xs">{t("fields.city")}</Label>
                  <Input id="h-city" value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-state" className="text-xs">{t("fields.state")}</Label>
                  <Input id="h-state" value={draft.state ?? ""} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-pincode" className="text-xs">{t("fields.pincode")}</Label>
                  <Input id="h-pincode" value={draft.pincode ?? ""} onChange={(e) => setDraft({ ...draft, pincode: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-phone" className="text-xs">{t("fields.phone")}</Label>
                  <Input id="h-phone" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-lat" className="text-xs">{t("fields.latitude")}</Label>
                  <Input
                    id="h-lat"
                    type="number"
                    step="any"
                    value={draft.latitude ?? ""}
                    onChange={(e) => setDraft({ ...draft, latitude: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-lng" className="text-xs">{t("fields.longitude")}</Label>
                  <Input
                    id="h-lng"
                    type="number"
                    step="any"
                    value={draft.longitude ?? ""}
                    onChange={(e) => setDraft({ ...draft, longitude: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h-rating" className="text-xs">{t("fields.rating")}</Label>
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
                  <Label htmlFor="h-beds" className="text-xs">{t("fields.beds")}</Label>
                  <Input
                    id="h-beds"
                    type="number"
                    value={draft.beds ?? ""}
                    onChange={(e) => setDraft({ ...draft, beds: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <Checkbox id="h-em" checked={Boolean(draft.emergency24x7)} onChange={(e) => setDraft({ ...draft, emergency24x7: e.target.checked })} />
                  <span>24×7 Emergency</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <Checkbox id="h-card" checked={Boolean(draft.hasCardiology)} onChange={(e) => setDraft({ ...draft, hasCardiology: e.target.checked })} />
                  <span>{t("fields.cardiology")} Unit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <Checkbox id="h-cath" checked={Boolean(draft.hasCathLab)} onChange={(e) => setDraft({ ...draft, hasCathLab: e.target.checked })} />
                  <span>{t("fields.cathLab")}</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2 border-t border-rose-200/60">
                <Button onClick={save} disabled={saving} size="sm" className="rounded-xl">
                  {saving ? "Saving..." : t("admin.save")}
                </Button>
                <Button variant="ghost" onClick={() => setDraft(null)} size="sm" className="rounded-xl">
                  {t("admin.cancel")}
                </Button>
              </div>
            </div>
          ) : null}

          {rows === null ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : rows.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 font-semibold text-slate-700 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t("fields.name")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.city")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.phone")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.rating")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                      <td className="px-4 py-3">{row.city ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">{row.phone ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">★ {row.rating.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => setDraft(row)} className="h-7 text-xs rounded-lg">
                            <Edit className="h-3 w-3 mr-1" />
                            {t("admin.edit")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => remove(row.id)} className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
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
