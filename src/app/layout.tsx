import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { MainNav } from "@/components/shared/main-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRISPRgarden - Plant Breeding & CRISPR Platform",
  description:
    "Design CRISPR guides, track experiments, and share methods for plant gene editing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <MainNav />
            <main className="container mx-auto px-4 py-6">{children}</main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
