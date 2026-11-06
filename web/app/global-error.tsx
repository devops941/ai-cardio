"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { t } from "@/lib/i18n";

// global-error replaces the root layout, so plain HTML is required here.
// We inline styles via className-like tokens that map directly to our CSS custom
// properties so no Tailwind JIT compilation is needed at this level.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#fdfbfb",
          color: "#1a0a0e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            borderRadius: "0.75rem",
            border: "1px solid #ffc6cf",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(74,2,24,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              height: 6,
              background: "linear-gradient(to right, #f1335c, #de1145, #9c0b35)",
            }}
          />

          <div style={{ padding: "1.5rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span
                style={{
                  display: "flex",
                  height: 44,
                  width: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.375rem",
                  backgroundColor: "#fff1f3",
                  color: "#de1145",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle style={{ width: 20, height: 20 }} />
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#9c0b35",
                  lineHeight: 1.3,
                }}
              >
                {t("appName")} — Critical error
              </h1>
            </div>

            {/* Body */}
            <p
              style={{
                margin: "0 0 1rem",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "#7a5560",
              }}
            >
              {t("errors.generic")} We apologise for the disruption. Please reload the page.
            </p>

            {error.digest && (
              <p
                style={{
                  margin: "0 0 1rem",
                  fontFamily: "monospace",
                  fontSize: "0.6875rem",
                  color: "#7a5560",
                  backgroundColor: "#f7f2f3",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0.75rem",
                }}
              >
                Ref: {error.digest}
              </p>
            )}

            {/* Retry button */}
            <button
              onClick={reset}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                border: "none",
                background: "linear-gradient(to right, #de1145, #bb0838, #9c0b35)",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              {t("errors.tryAgain")}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
