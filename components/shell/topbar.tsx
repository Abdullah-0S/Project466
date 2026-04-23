"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "./breadcrumbs";

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobile}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>
      <Breadcrumbs className="truncate" />
    </header>
  );
}
