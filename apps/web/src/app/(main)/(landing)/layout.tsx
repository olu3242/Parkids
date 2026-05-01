import "../../../components/landing/landingpage.css";

import { Inter, Fraunces } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

import { cn } from "@/lib/utils";
// import ToastContainer from "@/components/ui/ToastContainer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, fraunces.variable)}>
        {children}
        {/* <ToastContainer /> */}
      </body>
    </html>
  );
}
