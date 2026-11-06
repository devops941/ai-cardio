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
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Demographics */}
      <div className="lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-[var(--cardiac-600)]" />
              {t("profile.title")}
            </CardTitle>
            <p className="text-xs text-[var(--ink-500)]">
              Demographic factors used in cardiovascular baseline scoring
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              {profileMessage ? <Alert tone="success">{profileMessage}</Alert> : null}
              {profileError ? <Alert tone="error">{profileError}</Alert> : null}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">
                  {t("auth.name")}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="pl-10"
                  />
                  <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-[var(--ink-50)] pl-10 text-[var(--ink-500)]"
                  />
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  {t("fields.phone")}
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    placeholder="e.g. +91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10"
                  />
                  <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs font-semibold">
                    {t("check.age")}
                  </Label>
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
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs font-semibold">
                    {t("check.gender")}
                  </Label>
                  <Select
                    id="gender"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <option value="">Select gender...</option>
                    <option value="male">{t("check.male")}</option>
                    <option value="female">{t("check.female")}</option>
                    <option value="other">{t("check.other")}</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-semibold">
                  {t("check.city")}
                </Label>
                <div className="relative">
                  <Input
                    id="city"
                    placeholder="e.g. Chennai"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="pl-10"
                  />
                  <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : t("profile.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <div className="space-y-6 lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-[var(--cardiac-600)]" />
              {t("profile.changePassword")}
            </CardTitle>
            <p className="text-xs text-[var(--ink-500)]">
              Ensure a strong password of at least 8 characters
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              {passwordMessage ? <Alert tone="success">{passwordMessage}</Alert> : null}
              {passwordError ? <Alert tone="error">{passwordError}</Alert> : null}

              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs font-semibold">
                  {t("profile.currentPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    className="pl-10"
                  />
                  <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-semibold">
                  {t("profile.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className="pl-10"
                  />
                  <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
              </div>

              <Button type="submit" variant="outline" className="w-full">
                {t("profile.changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/50 p-5 text-xs text-[var(--ink-500)]">
          <div className="flex items-center gap-2 font-bold text-[var(--cardiac-800)]">
            <ShieldCheck className="h-4 w-4 text-[var(--cardiac-600)]" />
            Data protection guarantee
          </div>
          <p className="mt-2 text-[11px] leading-relaxed">
            All cardiovascular assessment parameters and personal health records are encrypted at
            rest with industry-standard bcrypt and TLS 1.3 protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
