"use client";

import { useCallback, useEffect, useState } from "react";

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

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.doctors")}</CardTitle>
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
                  <Label htmlFor="d-name">{t("fields.name")}</Label>
                  <Input id="d-name" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-spec">{t("fields.specialization")}</Label>
                  <Input id="d-spec" value={draft.specialization ?? ""} onChange={(e) => setDraft({ ...draft, specialization: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-qual">{t("fields.qualification")}</Label>
                  <Input id="d-qual" value={draft.qualification ?? ""} onChange={(e) => setDraft({ ...draft, qualification: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-exp">{t("fields.experienceYears")}</Label>
                  <Input
                    id="d-exp"
                    type="number"
                    value={draft.experienceYears ?? ""}
                    onChange={(e) => setDraft({ ...draft, experienceYears: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-phone">{t("fields.phone")}</Label>
                  <Input id="d-phone" value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-email">{t("fields.email")}</Label>
                  <Input id="d-email" type="email" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-days">{t("fields.availableDays")}</Label>
                  <Input id="d-days" value={draft.availableDays ?? ""} onChange={(e) => setDraft({ ...draft, availableDays: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-fee">{t("fields.consultationFee")}</Label>
                  <Input
                    id="d-fee"
                    type="number"
                    value={draft.consultationFee ?? ""}
                    onChange={(e) => setDraft({ ...draft, consultationFee: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-hospital">{t("fields.hospital")}</Label>
                  <Select
                    id="d-hospital"
                    value={draft.hospitalId ?? ""}
                    onChange={(e) => setDraft({ ...draft, hospitalId: e.target.value })}
                  >
                    <option value="">—</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </Select>
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
                    <th scope="col" className="px-3 py-2">{t("fields.specialization")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.hospital")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.specialization ?? "—"}</td>
                      <td className="px-3 py-2">{row.hospital?.name ?? "—"}</td>
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
        entity={t("admin.doctors")}
        endpoint="/api/admin/doctors/import"
        templateBase="doctors_template"
        onDone={load}
      />
    </div>
  );
}
