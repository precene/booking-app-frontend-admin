import { Outlet, createRootRoute } from "@tanstack/react-router";

import { Toaster } from "#/shared/components/ui/toast";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
