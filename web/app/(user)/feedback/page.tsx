"use client";

import { CheckCircle2, Heart, MessageSquare, Send, Star } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <Reveal>
        <Card className="overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]" />
          <CardContent className="p-8 sm:p-10">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-[var(--cardiac-600)]">
                <Heart className="h-8 w-8 animate-heartbeat" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--ink-900)]">
                {t("feedback.title")}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--ink-500)]">
                Your feedback directly informs our cardiovascular AI triage heuristics and clinical
                workflow improvements.
              </p>
            </div>

            <div className="mt-8">
              {done ? (
                <div className="flex flex-col items-center justify-center rounded-md border border-emerald-100 bg-emerald-50/60 p-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-emerald-950">
                    Thank you for your feedback
                  </h3>
                  <p className="mt-1.5 text-sm text-emerald-800">{t("feedback.thanks")}</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-6">
                  {error ? <Alert tone="error">{error}</Alert> : null}

                  <fieldset className="space-y-3 text-center">
                    <legend className="text-sm font-bold text-[var(--ink-900)]">
                      {t("feedback.rating")}
                    </legend>
                    <div className="flex justify-center gap-2.5 pt-1">
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
                            className={`flex h-14 w-14 items-center justify-center rounded-md border transition-all duration-200 ${
                              active
                                ? "border-amber-400 bg-amber-50 text-amber-500"
                                : "border-[var(--ink-100)] bg-white text-[var(--ink-300)] hover:border-amber-300 hover:text-amber-400"
                            }`}
                          >
                            <Star className={`h-7 w-7 ${active ? "fill-amber-400" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-700)]">
                      <MessageSquare className="h-4 w-4 text-[var(--cardiac-500)]" />
                      {t("feedback.message")}
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      maxLength={500}
                      placeholder="Share your thoughts on assessment accuracy, ease of use, or suggested enhancements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="text-right text-[11px] text-[var(--ink-300)]">
                      {message.length} / 500 characters
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={rating === 0 || submitting}
                    className="w-full"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : t("feedback.submit")}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
