"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Package,
  Send,
  Loader,
  ArrowRight,
  Lock,
  ShieldAlert,
  Weight,
  History,
  Sparkles
} from "lucide-react";

interface TransportRequest {
  id: number;
  name: string;
  phone: string;
  pickup_location: string;
  drop_location: string;
  travel_date: string;
  goods_description?: string;
  purpose?: string;
  weight_kg?: string;
  created_at: string;
}

export default function TransportPage() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requests, setRequests] = useState<TransportRequest[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "",
    pickup: "",
    drop: "",
    date: "",
    goods: "",
    weight: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("travel_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
    setListLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.pickup || !formData.drop || !formData.date) {
      setError("Please fill required fields marked with *");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: submitError } = await supabase.from("travel_requests").insert([
      {
        name: formData.name,
        phone: formData.phone,
        purpose: formData.purpose || null,
        pickup_location: formData.pickup,
        drop_location: formData.drop,
        travel_date: formData.date,
        goods_description: formData.goods || null,
        weight_kg: formData.weight || null,
      },
    ]);

    if (submitError) {
      setError(submitError.message);
    } else {
      setSuccess("Booking submitted successfully!");
      setFormData({ name: "", phone: "", purpose: "", pickup: "", drop: "", date: "", goods: "", weight: "" });
      fetchRequests();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eab308; border-radius: 10px; }
      `}</style>

      {/* --- YELLOW HERO SECTION --- */}
      <div className="bg-[#FFD700] pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mb-6">
            <div className="bg-white/40 p-4 rounded-3xl backdrop-blur-md border border-white/50 shadow-sm">
              <Truck size={40} className="text-slate-900" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900">
            Logistics Made Simple
          </motion.h1>
          <p className="text-slate-800 text-lg max-w-2xl mx-auto opacity-90 font-semibold flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            Find verified carriers for your transport needs instantly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- BOOKING FORM --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white shadow-2xl shadow-yellow-900/5 rounded-[2.5rem] overflow-hidden border border-slate-100"
          >
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                <Send className="text-amber-500" size={24} />
                Book Transport
              </h2>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
                    <ShieldAlert size={18} className="inline mr-2" /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold mb-6 border border-emerald-100">
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Full Name *" name="name" icon={<UserIcon size={18}/>} value={formData.name} onChange={handleChange} placeholder="John Doe" />
                  <FormInput label="Phone Number *" name="phone" icon={<Phone size={18}/>} value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <FormInput label="Pickup Location *" name="pickup" icon={<MapPin size={18}/>} value={formData.pickup} onChange={handleChange} placeholder="City, Area" />
                  <FormInput label="Drop Location *" name="drop" icon={<MapPin size={18}/>} value={formData.drop} onChange={handleChange} placeholder="City, Area" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Pickup Date *" name="date" type="date" icon={<Calendar size={18}/>} value={formData.date} onChange={handleChange} />
                  <FormInput label="Est. Weight (KG)" name="weight" icon={<Weight size={18}/>} value={formData.weight} onChange={handleChange} placeholder="e.g. 500" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                    <Package size={14}/> Goods Description
                  </label>
                  <textarea
                    name="goods"
                    value={formData.goods}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-semibold placeholder:text-slate-300 resize-none"
                    placeholder="Describe what you are transporting..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-[#FFD700] py-5 rounded-2xl font-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/> 
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* --- SIDE FEED --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <History className="text-amber-500" size={20} />
                Recent Requests
              </h2>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Live Feed</span>
              </div>
            </div>

            <div className="space-y-4 max-h-[850px] overflow-y-auto pr-2 custom-scrollbar">
              {listLoading ? (
                [1, 2, 3].map((n) => <div key={n} className="h-40 w-full bg-slate-100 animate-pulse rounded-[2rem]" />)
              ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">No requests found</div>
              ) : (
                requests.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-amber-200 transition-all border-l-4 border-l-[#FFD700]"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={12} className="text-amber-500" />
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">#TRP-{r.id}</span>
                    </div>

                    <div className="space-y-1 mb-5">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Route</p>
                      <div className="flex items-center gap-3 font-bold text-slate-800">
                        <span className="text-sm">{r.pickup_location}</span>
                        <ArrowRight size={16} className="text-amber-400 flex-shrink-0" />
                        <span className="text-sm">{r.drop_location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 mb-5">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load</p>
                        <p className="text-xs font-bold text-slate-700">{r.weight_kg ? `${r.weight_kg} KG` : "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Travel Date</p>
                        <p className="text-xs font-bold text-slate-700">{new Date(r.travel_date).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>

                    {/* Subscription Lock */}
                    <div className="p-4 bg-slate-50 rounded-2xl relative overflow-hidden group/lock border border-slate-100">
                      <div className="flex items-center gap-3 opacity-20 select-none">
                        <Lock size={14} className="flex-shrink-0" />
                        <span className="text-xs font-black blur-[4px] tracking-widest">{r.phone}</span>
                      </div>
                      <button 
                        onClick={() => window.location.href='/user/subscription-plans'}
                        className="absolute inset-0 w-full h-full bg-slate-900/0 hover:bg-slate-900 transition-all flex items-center justify-center opacity-0 hover:opacity-100 text-[10px] font-black text-[#FFD700] uppercase tracking-widest gap-2"
                      >
                        <Lock size={12} /> Unlock Phone Number
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, placeholder, name, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
      />
    </div>
  );
}