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
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full overflow-hidden">
        <Sidebar
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          friends={friends.map((f) => ({ id: f.id, name: f.name }))}
        />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 pb-20 lg:pb-6">
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
