"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Search, Stethoscope, Trash2 } from "lucide-react";

import { BulkImportCard } from "@/components/admin/bulk-import-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface DoctorRow {
  id: string;
  name: string;
  specialization: string | null;
  qualification: string | null;
  experienceYears: number | null;
  phone: string | null;
  email: string | null;
  availableDays: string | null;
  consultationFee: number | null;
  hospitalId: string | null;
  hospital: { id: string; name: string } | null;
}

interface HospitalOption {
  id: string;
  name: string;
}

const EMPTY: Partial<DoctorRow> = { name: "" };

export default function AdminDoctorsPage() {
  const [rows, setRows] = useState<DoctorRow[] | null>(null);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<DoctorRow> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [doctorData, hospitalData] = await Promise.all([
        apiFetch<{ items: DoctorRow[] }>(
          `/api/admin/doctors${query ? `?q=${encodeURIComponent(query)}` : ""}`,
        ),
        apiFetch<{ items: HospitalOption[] }>("/api/admin/hospitals"),
      ]);
      setRows(doctorData.items);
      setHospitals(hospitalData.items);
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
        specialization: draft.specialization ?? "",
        qualification: draft.qualification ?? "",
        experienceYears: draft.experienceYears ?? null,
        phone: draft.phone ?? "",
        email: draft.email ?? "",
        availableDays: draft.availableDays ?? "",
        consultationFee: draft.consultationFee ?? null,
        hospitalId: draft.hospitalId ?? "",
      };
      if (draft.id) {
        await apiFetch(`/api/admin/doctors/${draft.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/doctors", { method: "POST", body: JSON.stringify(payload) });
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
    if (!window.confirm(t("fields.deleteConfirmDoctor"))) return;
    try {
      await apiFetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
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
            <Stethoscope className="h-4 w-4 text-rose-600" />
            {t("admin.doctors")}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Manage practicing cardiologists, electrophysiologists, and cardiac surgeons
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Input
                id="q"
                placeholder="Search by doctor name or specialization..."
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
                {draft.id ? "Edit Cardiologist" : "Add New Cardiologist"}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="d-name" className="text-xs">{t("fields.name")}</Label>
                  <Input id="d-name" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-spec" className="text-xs">{t("fields.specialization")}</Label>
                  <Input id="d-spec" placeholder="e.g. Interventional Cardiology" value={draft.specialization ?? ""} onChange={(e) => setDraft({ ...draft, specialization: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-qual" className="text-xs">{t("fields.qualification")}</Label>
                  <Input id="d-qual" placeholder="e.g. MD, DM (Cardiology)" value={draft.qualification ?? ""} onChange={(e) => setDraft({ ...draft, qualification: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-exp" className="text-xs">{t("fields.experienceYears")}</Label>
                  <Input
                    id="d-exp"
                    type="number"
                    value={draft.experienceYears ?? ""}
                    onChange={(e) => setDraft({ ...draft, experienceYears: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-phone" className="text-xs">{t("fields.phone")}</Label>
                  <Input id="d-phone" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-email" className="text-xs">{t("fields.email")}</Label>
                  <Input id="d-email" type="email" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-days" className="text-xs">{t("fields.availableDays")}</Label>
                  <Input id="d-days" placeholder="e.g. Mon-Fri" value={draft.availableDays ?? ""} onChange={(e) => setDraft({ ...draft, availableDays: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-fee" className="text-xs">{t("fields.consultationFee")}</Label>
                  <Input
                    id="d-fee"
                    type="number"
                    value={draft.consultationFee ?? ""}
                    onChange={(e) => setDraft({ ...draft, consultationFee: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="d-hospital" className="text-xs">{t("fields.hospital")}</Label>
                  <Select
                    id="d-hospital"
                    value={draft.hospitalId ?? ""}
                    onChange={(e) => setDraft({ ...draft, hospitalId: e.target.value })}
                  >
                    <option value="">— Select Associated Hospital —</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </Select>
                </div>
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
                    <th scope="col" className="px-4 py-3">{t("fields.specialization")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.hospital")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                      <td className="px-4 py-3">{row.specialization ?? "—"}</td>
                      <td className="px-4 py-3 text-rose-700 font-medium">{row.hospital?.name ?? "—"}</td>
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
        entity={t("admin.doctors")}
        endpoint="/api/admin/doctors/import"
        templateBase="doctors_template"
        onDone={load}
      />
    </div>
  );
}
