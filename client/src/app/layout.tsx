import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StayOnTrack - AI-Powered Productivity",
  description: "Beat procrastination with intelligent AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
