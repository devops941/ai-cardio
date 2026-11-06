import { HeartPulseLoader } from "@/components/motion/heart-pulse-loader";

// Full-screen, opaque page-load overlay built around the cardiac Heart Pulse loader.
// Rendered by every route-level loading.tsx so ONLY the heartbeat is visible — it covers
// the header/footer/sidebar while the next route streams in.
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[var(--background)] px-4 text-center">
      <HeartPulseLoader size={88} />
      <p className="animate-fade-in text-sm font-medium tracking-wide text-[var(--ink-500)]">
        {label}
      </p>
    </div>
  );
}

export default PageLoader;
