"use client";

import { Printer, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ReportActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="text-xs"
      >
        <Printer className="mr-1.5 h-3.5 w-3.5 text-[var(--cardiac-600)]" />
        Print report
      </Button>
      <Button variant="outline" size="sm" asChild className="text-xs">
        <Link href="/check">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-[var(--cardiac-600)]" />
          New assessment
        </Link>
      </Button>
    </div>
  );
}
