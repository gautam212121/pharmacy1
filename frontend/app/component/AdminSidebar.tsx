"use client";

import Link from "next/link";

export default function AdminSidebar() {
  const items = [
    { label: "Dashboard", href: "/admin" },
    { label: "Orders", href: "/admin#orders" },
    { label: "Doctors", href: "/admin#doctors" },
    { label: "Lab Tests", href: "/admin#labtests" },
    { label: "Products", href: "/admin#products" },
    { label: "Product Categories", href: "/admin/categories" },
    { label: "Customers", href: "/admin#customers" },
  ];

  return (
    <aside className="w-64 bg-white border-r p-4 h-screen sticky top-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Admin panel</h2>
      </div>
      <nav className="flex flex-col space-y-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="px-3 py-2 rounded hover:bg-gray-100">
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
