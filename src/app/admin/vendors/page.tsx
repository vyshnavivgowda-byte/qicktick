"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, RefreshCw, Search, X, Mail, Phone, MapPin, Tag ,
  Briefcase, Globe, FileText, CheckCircle2, AlertCircle, 
  Building2, Hash, ExternalLink, Calendar
} from "lucide-react";

// --- Types synchronized with your SQL Schema ---
type Vendor = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  mobile_number: string | null;
  alternate_number: string | null;
  profile_info: string | null;
  company_name: string | null;
  business_type: string | null;
  media_files: string[] | null;
  status: string;
  subscription_plan: string | null;
  subscription_expiry: string | null;
  owner_name: string | null;
  gst_number: string | null;
  website: string | null;
  business_keywords: string | null;
  sector: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  company_logo: string | null;
  payment_id: string | null;
};

// --- Custom Hook ---
const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_register")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setVendors(data || []);
    setLoading(false);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("vendor_register").update({ status: newStatus }).eq("id", id);
    if (!error) setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  useEffect(() => { fetchVendors(); }, [fetchVendors]);
  return { vendors, loading, fetchVendors, updateStatus };
};

// --- Main Component ---
export default function VendorsPage() {
  const { vendors, loading, fetchVendors, updateStatus } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => vendors.filter(v => 
    `${v.company_name} ${v.email} ${v.gst_number} ${v.city}`.toLowerCase().includes(query.toLowerCase())
  ), [vendors, query]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
              <Building2 size={14} /> Administrative Portal
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Vendor <span className="text-red-600">Database</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by Company, GST, or City..."
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full sm:w-80 focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-xs uppercase tracking-widest shadow-sm"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button onClick={fetchVendors} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm transition-all">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 shadow-inner">
                    <Image src={vendor.company_logo || "/placeholder-logo.png"} alt="Logo" fill className="object-cover" />
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    vendor.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
                
                <h3 className="font-black text-slate-900 truncate uppercase tracking-tight text-lg mb-1">{vendor.company_name || "Untitled Business"}</h3>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-1">
                  <Tag size={10} /> {vendor.sector || "General Sector"}
                </p>
                
                <div className="space-y-2 mb-6 text-slate-500 font-bold text-[11px] uppercase tracking-wide">
                   <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-300" /> {vendor.city || 'Unknown'}, {vendor.state || 'IN'}</div>
                   <div className="flex items-center gap-2"><Hash size={14} className="text-slate-300" /> {vendor.gst_number || 'No GST'}</div>
                </div>

                <button 
                  onClick={() => setSelectedVendor(vendor)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                >
                  View Full Dossier
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INSPECTION MODAL */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl animate-in zoom-in duration-300">
              <button 
                onClick={() => setSelectedVendor(null)} 
                className="absolute right-8 top-8 z-10 p-2 bg-slate-100 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <X size={20}/>
              </button>
              
              {/* SIDE PANEL: IDENTITY */}
              <div className="md:w-1/3 bg-slate-50 p-10 flex flex-col items-center border-r border-slate-100 overflow-y-auto">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl overflow-hidden mb-6 border-4 border-white relative">
                  <Image src={selectedVendor.company_logo || "/placeholder-logo.png"} alt="Logo" fill className="object-cover" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase text-center leading-tight mb-2 tracking-tighter">
                  {selectedVendor.company_name}
                </h2>
                <div className="px-4 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
                  {selectedVendor.status}
                </div>
                
                <div className="w-full space-y-5 pt-8 border-t border-slate-200">
                  <div className="group flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Person</span>
                    <p className="text-xs font-bold text-slate-700">{selectedVendor.first_name} {selectedVendor.last_name}</p>
                  </div>
                  <div className="group flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Mail size={12} className="text-red-500"/> {selectedVendor.email}</p>
                  </div>
                  <div className="group flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Phone</span>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Phone size={12} className="text-red-500"/> {selectedVendor.mobile_number}</p>
                  </div>
                  <div className="group flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Presence</span>
                    <a href={selectedVendor.website || '#'} target="_blank" className="text-xs font-bold text-red-600 flex items-center gap-2 hover:underline">
                      <Globe size={12}/> {selectedVendor.website || "No Website"}
                    </a>
                  </div>
                </div>
              </div>

              {/* MAIN PANEL: DETAILS */}
              <div className="md:w-2/3 p-10 overflow-y-auto bg-white flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <FileText size={14}/> Business Compliance
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">GST Identification</p>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{selectedVendor.gst_number || "NOT REGISTERED"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">Business Sector</p>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{selectedVendor.sector || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <MapPin size={14}/> Office Address
                    </h4>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed mb-2">{selectedVendor.address}</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                      {selectedVendor.city}, {selectedVendor.state} - {selectedVendor.pincode}
                    </p>
                  </div>
                </div>

                <div className="mb-10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Business Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.business_keywords?.split(',').map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl border border-red-100">
                        {kw.trim()}
                      </span>
                    )) || <span className="text-slate-400 text-xs italic font-bold tracking-widest">No tags defined</span>}
                  </div>
                </div>

                <div className="mb-10 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Portfolio Gallery</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedVendor.media_files?.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:scale-105 transition-transform duration-300">
                        <img src={img} className="w-full h-full object-cover" alt="Portfolio" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* STICKY ACTIONS */}
                <div className="flex gap-4 sticky bottom-0 bg-white/80 backdrop-blur-sm pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => { updateStatus(selectedVendor.id, 'rejected'); setSelectedVendor(null); }} 
                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                  >
                    Reject Application
                  </button>
                  <button 
                    onClick={() => { updateStatus(selectedVendor.id, 'approved'); setSelectedVendor(null); }} 
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16}/> Approve Partner
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}