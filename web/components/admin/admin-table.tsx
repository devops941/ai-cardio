import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function AdminTableCard({
  icon: Icon,
  title,
  subtitle,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="h-4 w-4 text-[var(--cardiac-600)]" />
              {title}
            </CardTitle>
            {subtitle ? <p className="mt-1 text-xs text-[var(--ink-500)]">{subtitle}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--cardiac-100)]">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/70 font-bold text-[var(--ink-700)]">
          <tr>
            {head.map((label, index) => (
              <th
                key={label}
                scope="col"
                className={`px-4 py-3.5 ${index === head.length - 1 ? "text-right" : ""}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--cardiac-50)] text-[var(--ink-700)]">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmpty({ label }: { label: string }) {
  return <p className="py-8 text-center text-xs text-[var(--ink-500)]">{label}</p>;
}
