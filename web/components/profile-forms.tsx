"use client";

import { KeyRound, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface ProfileInitial {
  name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  city: string;
}

export function ProfileForms({ initial }: { initial: ProfileInitial }) {
  const [profile, setProfile] = useState(initial);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          age: profile.age ?? null,
          gender: profile.gender || null,
          city: profile.city,
        }),
      });
      setProfileMessage(t("profile.saved"));
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch("/api/profile/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: String(form.get("currentPassword") ?? ""),
          newPassword: String(form.get("newPassword") ?? ""),
        }),
      });
      setPasswordMessage(t("profile.passwordSaved"));
      event.currentTarget.reset();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-12">
      {/* Demographics Card */}
      <div className="md:col-span-7">
        <Card className="border-rose-100 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <User className="h-4 w-4 text-rose-600" />
              {t("profile.title")}
            </CardTitle>
            <p className="text-xs text-slate-500">Demographic factors used in cardiovascular baseline scoring</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              {profileMessage ? <Alert tone="success">{profileMessage}</Alert> : null}
              {profileError ? <Alert tone="error">{profileError}</Alert> : null}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">{t("auth.name")}</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="pl-9"
                  />
                  <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">{t("auth.email")}</Label>
                <div className="relative">
                  <Input id="email" value={profile.email} disabled className="pl-9 bg-slate-50 text-slate-500" />
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">{t("fields.phone")}</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    placeholder="e.g. +91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-9"
                  />
                  <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs">{t("check.age")}</Label>
                  <Input
                    id="age"
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Age"
                    value={profile.age ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs">{t("check.gender")}</Label>
                  <Select
                    id="gender"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <option value="">— Select Gender —</option>
                    <option value="male">{t("check.male")}</option>
                    <option value="female">{t("check.female")}</option>
                    <option value="other">{t("check.other")}</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs">{t("check.city")}</Label>
                <div className="relative">
                  <Input
                    id="city"
                    placeholder="e.g. Chennai"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="pl-9"
                  />
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full gap-2 rounded-xl">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : t("profile.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Credentials Card */}
      <div className="md:col-span-5 space-y-6">
        <Card className="border-rose-100 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <KeyRound className="h-4 w-4 text-rose-600" />
              {t("profile.changePassword")}
            </CardTitle>
            <p className="text-xs text-slate-500">Ensure a strong password of at least 8 characters</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              {passwordMessage ? <Alert tone="success">{passwordMessage}</Alert> : null}
              {passwordError ? <Alert tone="error">{passwordError}</Alert> : null}

              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs">{t("profile.currentPassword")}</Label>
                <div className="relative">
                  <Input id="currentPassword" name="currentPassword" type="password" required className="pl-9" />
                  <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs">{t("profile.newPassword")}</Label>
                <div className="relative">
                  <Input id="newPassword" name="newPassword" type="password" required className="pl-9" />
                  <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <Button type="submit" variant="outline" className="w-full rounded-xl border-slate-200 hover:border-rose-300 hover:text-rose-700">
                {t("profile.changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-rose-800">
            <ShieldCheck className="h-4 w-4 text-rose-600" />
            Data Protection Guarantee
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            All cardiovascular assessment parameters and personal health records are encrypted at rest with industry-standard bcrypt and TLS 1.3 protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
