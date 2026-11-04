"use client";

import { Download, Printer, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ReportActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="rounded-xl border-slate-200 text-xs text-slate-700 hover:border-rose-300 hover:text-rose-700"
      >
        <Printer className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
        Print Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="rounded-xl border-slate-200 text-xs text-slate-700 hover:border-rose-300 hover:text-rose-700"
      >
        <Link href="/check">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
          New Assessment
        </Link>
      </Button>
    </div>
  );
}

