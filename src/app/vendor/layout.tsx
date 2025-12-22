"use client";

import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* User Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Optional Vendor Sidebar (if needed later) */}
        {/* <aside className="w-64 bg-white shadow-md">
          Vendor Sidebar
        </aside> */}

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* User Footer */}
      <Footer />
    </div>
  );
}
