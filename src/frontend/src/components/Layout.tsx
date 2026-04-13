import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import SchoolHeader from "./SchoolHeader";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen flex flex-col bg-background">
        <SchoolHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 bg-card">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Rajkiyakrit Uchch Madhyamik Vidyalaya
              Kawakol, Nawada. All rights reserved.
            </p>
            <p className="mt-2">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
