"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileCheck, LayoutGrid } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Catalog", icon: LayoutGrid },
    { href: "/assets/asset_night_market_01", label: "Flagship Demo", icon: ShieldCheck },
    { href: "/control-room", label: "Control Room", icon: LayoutGrid },
    { href: "/receipt/verify", label: "Verify Receipt", icon: FileCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E4E2DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#091A2A] text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-[#1769E0] transition-colors">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#091A2A]">
                  OwnTerms
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EDF7F2] text-[#16805B] border border-[#C6E6D6]">
                  Orders v2
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] -mt-1 font-medium hidden sm:block">
                Your agent can use it—after it licenses it.
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#091A2A] text-white shadow-sm"
                    : "text-[#475569] hover:text-[#091A2A] hover:bg-[#F1EFEA]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sandbox Status Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-[#475569] bg-[#F1EFEA] border border-[#CBD5E1] px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#16805B]" />
          <span>PayPal Orders v2 (Sandbox Mode)</span>
        </div>
      </div>
    </header>
  );
}

