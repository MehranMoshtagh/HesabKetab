import SessionProvider from "@/components/providers/SessionProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg)] p-4">
        {children}
      </div>
    </SessionProvider>
  );
}
