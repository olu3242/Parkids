"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
// import { ThemeProvider } from "@/components/theme-provider";
// import ThemeToggle from "@/components/ThemeToggle";
import { UserProvider } from "@/components/user-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      })
  );
  return (
    <UserProvider>
      {/* <ThemeProvider> */}
      <QueryClientProvider client={queryClient}>
        {children}
        {/* <div className="fixed bottom-4 right-4 z-[120]">
            <ThemeToggle />
          </div> */}
      </QueryClientProvider>
      {/* </ThemeProvider> */}
    </UserProvider>
  );
}
