"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import SessionProvider from "@/components/providers/SessionProvider";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import SettleUpModal from "@/components/settle/SettleUpModal";
import { useAppData } from "@/hooks/useAppData";
import { useAppStore } from "@/stores/app-store";

function AppShellInner({ children }: { children: React.ReactNode }) {
  useAppData();
  const { friends, groups } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          friends={friends.map((f) => ({ id: f.id, name: f.name }))}
        />
        <main className="flex-1 p-5 min-h-[calc(100vh-3rem)] pb-20 lg:pb-5">
          {children}
        </main>
      </div>
      <MobileNav />
      <AddExpenseModal />
      <SettleUpModal />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShellInner>{children}</AppShellInner>
    </SessionProvider>
  );
}
