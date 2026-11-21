import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import ThemedToaster from "@/src/components/ThemedToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "ShomajSetu | Together We Create a Better Tomorrow",
    template: "%s | ShomajSetu",
  },
  description:
    "ShomajSetu connects neighbors across Bangladesh to organize, join, and celebrate community service events for a better tomorrow.",
  applicationName: "ShomajSetu",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-surface text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
