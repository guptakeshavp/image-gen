import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <div className="border-border/70 bg-white/80 supports-[backdrop-filter]:bg-white/70 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-4 py-3">
        <nav className="flex gap-5 text-base font-semibold">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to} className="[&.active]:text-primary text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
