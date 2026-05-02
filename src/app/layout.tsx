import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { ProductFormProvider } from "@/components/product-form-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Empties",
  description: "A collection of your skincare products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <div className='min-h-screen'>
          <ProductFormProvider>
            <MainNav />
            <main className='container mx-auto px-4 py-8'>
              {children}
            </main>
          </ProductFormProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
