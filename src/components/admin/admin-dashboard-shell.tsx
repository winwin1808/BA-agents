"use client";

import { useEffect, useState } from "react";

import { AdminDashboard } from "@/components/admin/admin-dashboard";

type AdminDashboardProps = React.ComponentProps<typeof AdminDashboard>;

export function AdminDashboardShell(props: AdminDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 text-sm text-neutral-500">
        Loading admin dashboard...
      </div>
    );
  }

  return <AdminDashboard {...props} />;
}
