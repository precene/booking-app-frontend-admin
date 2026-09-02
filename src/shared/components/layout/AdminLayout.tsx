import { useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Film,
  Users,
  Ticket,
  LogOut,
  Building2,
  MapPinned,
  CreditCard,
  BadgePercent,
  CalendarClock,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

import { authApi } from "#/features/auth/services/authApi";
import { useAuthStore } from "#/features/auth/store/authStore";
import { Button } from "#/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/shared/components/ui/tooltip";
import { cn } from "#/shared/utils/cn";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Film, label: "Movies", to: "/movies" },
  { icon: MapPinned, label: "Cities", to: "/cities" },
  { icon: Building2, label: "Venues", to: "/venues" },
  { icon: CalendarClock, label: "Showtimes", to: "/showtimes" },
  { icon: Ticket, label: "Bookings", to: "/bookings" },
  { icon: Users, label: "Customers", to: "/customers" },
  { icon: CreditCard, label: "Payments", to: "/payments" },
  { icon: BadgePercent, label: "Coupons", to: "/coupons" },
] as const;

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      useAuthStore.getState().logout();
      void navigate({ to: "/login" });
    }
  }

  return (
    <div className="bg-background flex min-h-screen">
      <aside
        className={cn(
          "bg-surface fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-[width] duration-200",
          isCollapsed ? "w-18" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <ReceiptText className="size-5" />
          </div>
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">977Cinema</p>
              <p className="text-muted truncate text-xs">Admin Panel</p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <SidebarLink isCollapsed={isCollapsed} item={item} key={item.to} />
          ))}
        </nav>

        <div className="border-t p-3">
          <Button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("w-full", isCollapsed && "px-0")}
            onClick={() => setIsCollapsed((currentValue) => !currentValue)}
            type="button"
            variant="outline"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[padding-left] duration-200",
          isCollapsed ? "pl-18" : "pl-64",
        )}
      >
        <header className="bg-surface/95 sticky top-0 z-30 border-b backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="min-w-0">
              <h1 className="max-w-80 truncate text-sm font-semibold tracking-normal">
                {user?.fullName ?? user?.email}
              </h1>
              <p className="text-muted max-w-96 truncate text-xs">
                {user ? `${user.email}` : null}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleLogout} type="button">
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type SidebarItem = (typeof navItems)[number];

function SidebarLink({ isCollapsed, item }: { isCollapsed: boolean; item: SidebarItem }) {
  const Icon = item.icon;
  const link = (
    <Link
      activeProps={{
        className:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      }}
      className="text-muted-foreground hover:bg-primary/90 hover:text-primary-foreground flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors"
      to={item.to}
    >
      <Icon className="size-4 shrink-0" />
      {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!isCollapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger>{link}</TooltipTrigger>
      <TooltipContent>{item.label}</TooltipContent>
    </Tooltip>
  );
}
