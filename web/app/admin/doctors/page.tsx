"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Search, Stethoscope, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmpty, AdminTable, AdminTableCard } from "@/components/admin/admin-table";
import { BulkImportCard } from "@/components/admin/bulk-import-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
    const isEdit = Boolean(draft.id);
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
      toast.success(isEdit ? "Doctor updated successfully." : "Doctor added successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await apiFetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
      setRows((prev) => (prev ? prev.filter((row) => row.id !== id) : prev));
      toast.success("Doctor deleted successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
        title={t("admin.delete")}
        description={t("fields.deleteConfirmDoctor")}
        onConfirm={handleConfirmDelete}
      />

      <AdminPageHeader
        icon={Stethoscope}
        title={t("admin.doctors")}
        subtitle="Manage practicing cardiologists, electrophysiologists, and cardiac surgeons."
        action={
          <Button size="sm" onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="h-4 w-4" />
            {t("admin.add")}
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {draft ? (
        <div className="space-y-4 rounded-lg border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-5">
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--cardiac-800)]">
            {draft.id ? "Edit specialist profile" : "Add new specialist"}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field id="d-name" label={t("fields.name")} value={draft.name ?? ""} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field id="d-spec" label={t("fields.specialization")} value={draft.specialization ?? ""} onChange={(v) => setDraft({ ...draft, specialization: v })} />
            <Field id="d-qual" label={t("fields.qualification")} value={draft.qualification ?? ""} onChange={(v) => setDraft({ ...draft, qualification: v })} />
            <Field
              id="d-exp"
              label={t("fields.experienceYears")}
              type="number"
              value={draft.experienceYears ?? ""}
              onChange={(v) => setDraft({ ...draft, experienceYears: v ? Number(v) : null })}
            />
            <Field id="d-phone" label={t("fields.phone")} value={draft.phone ?? ""} onChange={(v) => setDraft({ ...draft, phone: v })} />
            <Field id="d-email" label={t("fields.email")} value={draft.email ?? ""} onChange={(v) => setDraft({ ...draft, email: v })} />
            <Field id="d-days" label={t("fields.availableDays")} value={draft.availableDays ?? ""} onChange={(v) => setDraft({ ...draft, availableDays: v })} />
            <Field
              id="d-fee"
              label={t("fields.consultationFee")}
              type="number"
              value={draft.consultationFee ?? ""}
              onChange={(v) => setDraft({ ...draft, consultationFee: v ? Number(v) : null })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="d-hospital" className="text-xs font-semibold text-[var(--ink-700)]">
                {t("fields.hospital")}
              </Label>
              <Select
                id="d-hospital"
                value={draft.hospitalId ?? ""}
                onChange={(e) => setDraft({ ...draft, hospitalId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex gap-2 border-t border-[var(--cardiac-200)]/60 pt-4">
            <Button onClick={save} disabled={saving} size="sm">
              {saving ? "Saving..." : t("admin.save")}
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)} size="sm">
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      <AdminTableCard
        icon={Stethoscope}
        title={t("admin.doctors")}
        subtitle={`${rows?.length ?? 0} ${t("fields.entries")}`}
        action={
          <div className="relative w-full sm:w-64">
            <Input
              id="q"
              placeholder="Search name or specialization..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
          </div>
        }
      >
        {rows === null ? (
          <Skeleton className="h-40 w-full" />
        ) : rows.length === 0 ? (
          <AdminEmpty label={t("admin.noData")} />
        ) : (
          <AdminTable
            head={[
              t("fields.name"),
              t("fields.specialization"),
              t("fields.qualification"),
              t("fields.hospital"),
              t("fields.consultationFee"),
              t("fields.actions"),
            ]}
          >
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[var(--cardiac-50)]/40">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--ink-900)]">{row.name}</div>
                  {row.experienceYears ? (
                    <div className="mt-0.5 text-[11px] text-[var(--ink-500)]">
                      {row.experienceYears} yrs experience
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3.5">
                  {row.specialization ? <Badge tone="cardiac">{row.specialization}</Badge> : <span className="text-[var(--ink-300)]">—</span>}
                </td>
                <td className="px-4 py-3.5 text-[var(--ink-500)]">{row.qualification ?? "—"}</td>
                <td className="px-4 py-3.5 text-[var(--ink-500)]">{row.hospital?.name ?? "—"}</td>
                <td className="px-4 py-3.5 font-semibold text-[var(--ink-900)]">
                  {row.consultationFee != null ? `₹${row.consultationFee}` : "—"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setDraft(row)} className="h-8 text-xs">
                      <Edit className="mr-1 h-3 w-3" />
                      {t("admin.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteId(row.id)}
                      className="h-8 w-8 p-0 text-[var(--ink-300)] hover:bg-[var(--cardiac-50)] hover:text-[var(--cardiac-600)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">{t("admin.delete")}</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminTableCard>

      <BulkImportCard
        entity={t("admin.doctors")}
        endpoint="/api/admin/doctors/import"
        templateBase="doctors_template"
        onDone={load}
      />
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-[var(--ink-700)]">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
        {...rest}
      />
    </div>
  );
}
