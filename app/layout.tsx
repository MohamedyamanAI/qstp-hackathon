import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ServiceWorkerRegister } from "@/components/sw-register"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "QSTP Hackathon",
  description: "QSTP Hackathon application",
  applicationName: "QSTP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QSTP",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
