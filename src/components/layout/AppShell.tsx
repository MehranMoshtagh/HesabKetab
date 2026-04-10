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
    <>
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          friends={friends.map((f) => ({ id: f.id, name: f.name }))}
        />
        <main className="flex-1 p-4 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-4">
          {children}
        </main>
      </div>
      <MobileNav />
      <AddExpenseModal />
      <SettleUpModal />
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShellInner>{children}</AppShellInner>
    </SessionProvider>
  );
}
