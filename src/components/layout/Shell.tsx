import type { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
  nav: ReactNode;
}

export default function Shell({ children, nav }: ShellProps) {
  return (
    <div className="flex h-full flex-col bg-bg">
      <main className="scroll-area flex-1 pt-[env(safe-area-inset-top)]">
        {children}
      </main>
      {nav}
    </div>
  );
}
