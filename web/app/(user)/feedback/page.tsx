"use client";

import { CheckCircle2, Heart, MessageSquare, Send, Star } from "lucide-react";
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
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ rating, comment: message }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="overflow-hidden border-rose-100 shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700" />
        <CardHeader className="text-center pb-3 pt-6">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Heart className="h-6 w-6 heartbeat" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">{t("feedback.title")}</CardTitle>
          <p className="text-xs text-slate-500">
            Your feedback directly informs our cardiovascular AI triage heuristics and clinical workflow improvements.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {done ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/60 p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h3 className="mt-3 font-bold text-emerald-950">Thank You For Your Feedback</h3>
              <p className="mt-1 text-xs text-emerald-800">{t("feedback.thanks")}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {error ? <Alert tone="error">{error}</Alert> : null}

              <fieldset className="space-y-2 text-center">
                <legend className="text-xs font-semibold text-slate-700">{t("feedback.rating")}</legend>
                <div className="flex justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = (hoverRating || rating) >= value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        aria-pressed={rating === value}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(value)}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 ${
                          active
                            ? "border-amber-400 bg-amber-50 text-amber-500 shadow-xs scale-105"
                            : "border-slate-200 bg-white text-slate-300 hover:border-amber-300 hover:text-amber-400"
                        }`}
                      >
                        <Star className={`h-6 w-6 ${active ? "fill-amber-400" : ""}`} />
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-medium text-slate-700">
                  {t("feedback.message")}
                </Label>
                <Textarea
                  id="message"
                  rows={4}
                  maxLength={500}
                  placeholder="Share your thoughts on assessment accuracy, ease of use, or suggested enhancements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="text-right text-[11px] text-slate-400">
                  {message.length} / 500 characters
                </div>
              </div>

              <Button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full gap-2 rounded-xl shadow-md shadow-rose-600/20"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : t("feedback.submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
