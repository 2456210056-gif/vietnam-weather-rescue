"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

type AppProvidersProps = {
  children: React.ReactNode;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu.");
  }

  return response.json();
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
            staleTime: 60_000
          }
        }
      })
  );

  return (
    <SessionProvider refetchOnWindowFocus>
      <QueryClientProvider client={queryClient}>
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: true,
            shouldRetryOnError: false
          }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </SWRConfig>
      </QueryClientProvider>
    </SessionProvider>
  );
}
