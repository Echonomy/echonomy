import "~/styles/globals.css";

import { Suspense } from "react";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/utils/trpc";
// import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from "~/components/ui/navigation-menu"; // Import Navigation components
import { Nav } from "~/components/navbar";
import { DynamicProvider } from "~/components/dynamic-provider";
import { SafeAccountProvider } from "~/components/safe-account-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "IndieTunes",
  description: "IndieTunes",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable}`}>
        <div className="m-auto max-w-5xl">
          <Suspense fallback={<div>Loading...</div>}>
            <TRPCReactProvider>
              <DynamicProvider>
                <SafeAccountProvider>
                  <Nav />
                  <hr className="mt-4" />
                  {children}
                </SafeAccountProvider>
              </DynamicProvider>
            </TRPCReactProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
