"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Eye, X, MapPin, Calendar, Phone, Package, 
  ChevronRight, Search, RefreshCw, Loader2, ArrowRightLeft 
} from "lucide-react";

type TravelRequest = {
  id: number;
  name: string;
  phone: string;
  purpose: string | null;
  pickup_location: string | null;
  drop_location: string | null;
  travel_date: string | null;
  goods_description: string | null;
  weight_kg: string | null;
  created_at: string | null;
};

export default function TravelRequestsPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("travel_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) console.error(error);
    else setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.phone.includes(searchQuery)
    );
  }, [requests, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Travel <span className="text-red-600">Manifest</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">
              Logistics & Dispatch Management
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl w-full md:w-72 focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-xs uppercase tracking-widest shadow-sm transition-all"
              />
            </div>
            <button 
              onClick={fetchRequests} 
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Data Table / List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Requestor</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Route</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Purpose</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/50"></td>
                    </tr>
                  ))
                ) : filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 uppercase tracking-tight">{req.name}</div>
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                        <Phone size={10} /> {req.phone}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter">
                        <span className="text-slate-400">{req.pickup_location || "N/A"}</span>
                        <ChevronRight size={14} className="text-red-500" />
                        <span className="text-slate-900">{req.drop_location || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-600">
                        <Calendar size={14} className="text-slate-300" />
                        {req.travel_date ? new Date(req.travel_date).toLocaleDateString() : "Pending"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 italic">
                      {req.purpose || "-"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg active:scale-95"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredRequests.length === 0 && (
            <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest text-sm">
              No matching requests found
            </div>
          )}
        </div>

        {/* Modal Redesign */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
              
              {/* Close Button */}
              <button 
                className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full hover:bg-red-600 hover:text-white transition-all"
                onClick={() => setSelectedRequest(null)}
              >
                <X size={20} />
              </button>

              <div className="p-10">
                <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                  <ArrowRightLeft size={14} /> Request Dossier #{selectedRequest.id}
                </div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic mb-8 border-b pb-4">
                  {selectedRequest.name}<span className="text-slate-400 font-light">'s Request</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Route Info */}
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Primary Route</h4>
                      <div className="space-y-4 relative">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 w-2 h-2 rounded-full bg-slate-300 border-4 border-white ring-2 ring-slate-100 shadow-sm" />
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Pickup Location</p>
                            <p className="text-xs font-bold text-slate-900">{selectedRequest.pickup_location || "Not Specified"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="mt-1 w-2 h-2 rounded-full bg-red-600 border-4 border-white ring-2 ring-red-100 shadow-sm" />
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Drop Location</p>
                            <p className="text-xs font-bold text-slate-900">{selectedRequest.drop_location || "Not Specified"}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Scheduling</h4>
                      <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Travel Date</p>
                            <p className="text-xs font-bold text-slate-900 italic">{selectedRequest.travel_date || "Pending"}</p>
                         </div>
                         <Calendar className="text-slate-200" size={24} />
                      </div>
                    </section>
                  </div>

                  {/* Cargo Info */}
                  <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Package size={14} className="text-red-500" /> Cargo Specifications
                    </h4>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Goods Description</p>
                        <p className="text-xs font-bold leading-relaxed">{selectedRequest.goods_description || "No cargo described"}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load Weight</p>
                          <p className="text-2xl font-black italic">{selectedRequest.weight_kg ? `${selectedRequest.weight_kg} kg` : "N/A"}</p>
                        </div>
                        <div className="text-[9px] font-black text-slate-600 uppercase">System Verified</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><Phone size={14} /></div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">{selectedRequest.phone}</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">Created: {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}