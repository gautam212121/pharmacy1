"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import { CartProvider } from "./context/cartContext";
import { UserProvider } from "./context/UserContext";
import { CategoryProvider } from "./context/CategoryContext";
import Header from "./component/header";
import Footer from "./component/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body className={isAdminPage ? "bg-gray-50 text-gray-900" : "bg-background text-text"}>
        <UserProvider>
          <CartProvider>
            <CategoryProvider>
              {!isAdminPage && <Header />}
              {children}
              {/* {!isAdminPage && <Footer />} */}
            </CategoryProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
