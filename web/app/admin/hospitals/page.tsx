"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmpty, AdminTable, AdminTableCard } from "@/components/admin/admin-table";
import { BulkImportCard } from "@/components/admin/bulk-import-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <AdminPageHeader
        icon={Building2}
        title={t("admin.hospitals")}
        subtitle="Manage certified cardiology centers, 24×7 emergency facilities, and catheterization labs."
        action={
          <Button size="sm" onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="h-4 w-4" />
            {t("admin.add")}
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {draft ? (
        <div className="space-y-4 rounded-3xl border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-5">
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--cardiac-800)]">
            {draft.id ? "Edit cardiac facility" : "Add new cardiac facility"}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field id="h-name" label={t("fields.name")} value={draft.name ?? ""} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field id="h-address" label={t("fields.address")} value={draft.address ?? ""} onChange={(v) => setDraft({ ...draft, address: v })} />
            <Field id="h-city" label={t("fields.city")} value={draft.city ?? ""} onChange={(v) => setDraft({ ...draft, city: v })} />
            <Field id="h-state" label={t("fields.state")} value={draft.state ?? ""} onChange={(v) => setDraft({ ...draft, state: v })} />
            <Field id="h-pincode" label={t("fields.pincode")} value={draft.pincode ?? ""} onChange={(v) => setDraft({ ...draft, pincode: v })} />
            <Field id="h-phone" label={t("fields.phone")} value={draft.phone ?? ""} onChange={(v) => setDraft({ ...draft, phone: v })} />
            <Field
              id="h-lat"
              label={t("fields.latitude")}
              type="number"
              step="any"
              value={draft.latitude ?? ""}
              onChange={(v) => setDraft({ ...draft, latitude: v ? Number(v) : null })}
            />
            <Field
              id="h-lng"
              label={t("fields.longitude")}
              type="number"
              step="any"
              value={draft.longitude ?? ""}
              onChange={(v) => setDraft({ ...draft, longitude: v ? Number(v) : null })}
            />
            <Field
              id="h-rating"
              label={t("fields.rating")}
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={draft.rating ?? 0}
              onChange={(v) => setDraft({ ...draft, rating: Number(v) })}
            />
            <Field
              id="h-beds"
              label={t("fields.beds")}
              type="number"
              value={draft.beds ?? ""}
              onChange={(v) => setDraft({ ...draft, beds: v ? Number(v) : null })}
            />
          </div>

          <div className="flex flex-wrap gap-5 border-t border-[var(--cardiac-200)]/60 pt-4">
            <Toggle label="24×7 emergency" checked={Boolean(draft.emergency24x7)} onChange={(c) => setDraft({ ...draft, emergency24x7: c })} />
            <Toggle label={`${t("fields.cardiology")} unit`} checked={Boolean(draft.hasCardiology)} onChange={(c) => setDraft({ ...draft, hasCardiology: c })} />
            <Toggle label={t("fields.cathLab")} checked={Boolean(draft.hasCathLab)} onChange={(c) => setDraft({ ...draft, hasCathLab: c })} />
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
        icon={Building2}
        title={t("admin.hospitals")}
        subtitle={`${rows?.length ?? 0} ${t("fields.entries")}`}
        action={
          <div className="relative w-full sm:w-64">
            <Input
              id="q"
              placeholder="Search by name or city..."
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
            head={[t("fields.name"), t("fields.city"), t("fields.phone"), t("fields.rating"), t("fields.actions")]}
          >
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[var(--cardiac-50)]/40">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--ink-900)]">{row.name}</div>
                  <div className="mt-0.5 flex gap-1.5">
                    {row.emergency24x7 ? <Badge tone="cardiac">24×7</Badge> : null}
                    {row.hasCathLab ? <Badge tone="amber">{t("fields.cathLab")}</Badge> : null}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[var(--ink-500)]">{row.city ?? "—"}</td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-[var(--ink-500)]">{row.phone ?? "—"}</td>
                <td className="px-4 py-3.5 font-semibold text-amber-600">★ {row.rating.toFixed(1)}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setDraft(row)} className="h-8 text-xs">
                      <Edit className="mr-1 h-3 w-3" />
                      {t("admin.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(row.id)}
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
        entity={t("admin.hospitals")}
        endpoint="/api/admin/hospitals/import"
        templateBase="hospitals_template"
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
  min?: number;
  max?: number;
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[var(--ink-700)]">
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
