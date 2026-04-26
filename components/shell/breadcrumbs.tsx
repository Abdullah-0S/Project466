"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { routeLabels } from "./nav-items";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  if (!pathname || pathname === "/") {
    return (
      <nav className={cn("flex items-center text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
        <Home className="h-4 w-4" />
        <span className="ml-2 font-medium text-foreground">Dashboard</span>
      </nav>
    );
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((_, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = routeLabels[href] ?? segments[idx].replace(/-/g, " ");
    return { href, label };
  });

  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
            {last ? (
              <span className="font-medium text-foreground capitalize">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-foreground capitalize">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
