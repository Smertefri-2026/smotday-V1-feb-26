"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function Navbar() {
  const pathname = usePathname();

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth");

  const links = useMemo(() => [{ href: "/products", label: "Products" }], []);

  const Logo = ({ size = 30 }: { size?: number }) => (
    <span
      className="font-brand tracking-tight transition-opacity hover:opacity-95"
      style={{ fontSize: size, lineHeight: 1, letterSpacing: "-0.02em" }}
    >
      <span style={{ color: "var(--sd-primary)" }}>Smoo</span>
      <span style={{ color: "var(--sd-teal)" }}>day</span>
    </span>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(229,231,235,0.95)] bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        {/* Desktop */}
        <div className="hidden h-20 items-center justify-between md:flex">
          <Link href="/" className="flex items-center" aria-label="Go home">
            <Logo size={32} />
          </Link>

          {!isAuthRoute && (
            <nav className="flex items-center gap-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="pill">
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {isAuthRoute ? (
              <Link href="/" className="btn btn-ghost">
                Back
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile (no dropdown) */}
        <div className="py-3 md:hidden">
          <div className="grid grid-cols-3 items-center">
            {/* Left: logo */}
            <div className="justify-self-start">
              <Link href="/" className="flex items-center" aria-label="Go home">
                <Logo size={26} />
              </Link>
            </div>

            {/* Middle: Products */}
            <div className="justify-self-center">
              {!isAuthRoute && (
                <Link href="/products" className="pill">
                  Products
                </Link>
              )}
            </div>

            {/* Right: Login / Back */}
            <div className="justify-self-end">
              {isAuthRoute ? (
                <Link href="/" className="btn btn-ghost" style={{ padding: "0.55rem 0.9rem" }}>
                  Back
                </Link>
              ) : (
                <Link href="/login" className="btn btn-primary" style={{ padding: "0.55rem 0.9rem" }}>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}