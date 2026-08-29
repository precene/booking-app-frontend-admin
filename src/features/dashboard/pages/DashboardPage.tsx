import { useAuthStore } from "#/features/auth/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">Dashboard</h2>
        <p className="text-muted mt-2 text-sm">Overview of 977Cinema admin operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-surface rounded-lg border p-5 shadow-sm">
          <p className="text-muted text-sm font-medium">Signed in as</p>
          <p className="mt-2 text-lg font-semibold">{user?.fullName ?? user?.email}</p>
          <p className="text-muted mt-1 text-sm">{user?.email}</p>
        </div>
        <div className="bg-surface rounded-lg border p-5 shadow-sm">
          <p className="text-muted text-sm font-medium">Today&apos;s bookings</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
        <div className="bg-surface rounded-lg border p-5 shadow-sm">
          <p className="text-muted text-sm font-medium">Active shows</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
      </div>
    </section>
  );
}
