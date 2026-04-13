"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./components/sidebare";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 🚀 UPDATED: We now hide the sidebar on the Login page AND the Home page ("/")
  const isPublicPage = pathname === "/login" || pathname === "/";

  return (
    <html lang="fr">
      <body className="bg-gray-50 flex">
        {/* Only show Sidebar if we are NOT on a public page */}
        {!isPublicPage && <Sidebar />}

        <main className={`flex-1 min-h-screen ${!isPublicPage ? "ml-72" : ""}`}>
          {children}
        </main>
      </body>
    </html>
  );
}