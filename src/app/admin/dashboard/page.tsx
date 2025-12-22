"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, Store, Truck, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalTransport, setTotalTransport] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/count-users");
      const userData = await res.json();
      setTotalCustomers(userData.totalCustomers || 0);

      const { count: vendors } = await supabase
        .from("vendor_register")
        .select("*", { count: "exact", head: true });
      setTotalVendors(vendors || 0);

      const { count: transport } = await supabase
        .from("travel_requests")
        .select("*", { count: "exact", head: true });
      setTotalTransport(transport || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your platform activities</p>
        </div>
        <button 
          onClick={fetchCounts}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        
        {/* Customer Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Customers</h2>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">{totalCustomers}</p>
          <Link href="/admin/customers" className="flex items-center gap-1 text-blue-600 text-sm font-semibold mt-4 hover:underline">
            View details <ArrowRight size={14} />
          </Link>
        </div>

        {/* Vendor Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <Store size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Vendors</h2>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">{totalVendors}</p>
          <Link href="/admin/vendors" className="flex items-center gap-1 text-red-600 text-sm font-semibold mt-4 hover:underline">
            View details <ArrowRight size={14} />
          </Link>
        </div>

        {/* Transport Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Truck size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Transport Requests</h2>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">{totalTransport}</p>
          <Link href="/admin/transportation" className="flex items-center gap-1 text-orange-600 text-sm font-semibold mt-4 hover:underline">
            View details <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* Quick Links Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Common Management Tasks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Manage Categories", href: "/admin/category" },
            { name: "Website Banners", href: "/admin/site-home/digital-banner" },
            { name: "Payment Tracking", href: "/admin/payment-tracking" },
            { name: "Sub Admin Panel", href: "/admin/subadmins" }
          ].map((task) => (
            <Link 
              key={task.name} 
              href={task.href}
              className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
            >
              {task.name}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}