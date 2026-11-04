import { CheckWizard } from "@/components/check/check-wizard";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <CheckWizard />
    </div>
  );
}
