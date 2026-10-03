"use client";

import { ClipboardListIcon, UtensilsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const AdminNav = ({ slug }: { slug: string }) => {
  const pathname = usePathname();
  const links = [
    { href: `/${slug}/admin`, label: "Pedidos", icon: ClipboardListIcon },
    { href: `/${slug}/admin/cardapio`, label: "Cardápio", icon: UtensilsIcon },
  ];

  return (
    <nav
      aria-label="Painel"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNav;
