"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ rating, comment: message }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("feedback.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <Alert tone="success">{t("feedback.thanks")}</Alert>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error ? <Alert tone="error">{error}</Alert> : null}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-800">{t("feedback.rating")}</legend>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      aria-pressed={rating === value}
                      onClick={() => setRating(value)}
                      className={`h-11 w-11 rounded-md border text-lg ${
                        rating >= value
                          ? "border-amber-400 bg-amber-100 text-amber-700"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="space-y-2">
                <Label htmlFor="message">{t("feedback.message")}</Label>
                <Textarea
                  id="message"
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={rating === 0}>
                {t("feedback.submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
