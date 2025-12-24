"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Send, 
  Loader, 
  Lock, 
  ShieldAlert, 
  History,
  Calendar,
  Sparkles
} from "lucide-react";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  is_subscribed: boolean;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setEnquiries(data || []);
    setLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setFormError("Please fill in required fields marked with *");
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("enquiries").insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
        user_id: user?.id ?? null,
        is_subscribed: false,
      },
    ]);

    if (error) {
      setFormError("Failed to submit enquiry.");
    } else {
      setFormSuccess("Your enquiry has been sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      fetchEnquiries();
    }
    setFormLoading(false);
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
              <MessageSquare size={40} className="text-slate-900" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900">
            Need Some Help?
          </motion.h1>
          <p className="text-slate-800 text-lg max-w-2xl mx-auto opacity-90 font-semibold flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            Drop us an enquiry and we'll get back to you shortly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- ENQUIRY FORM --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white shadow-2xl shadow-yellow-900/5 rounded-[2.5rem] overflow-hidden border border-slate-100"
          >
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                <Send className="text-amber-500" size={24} />
                Send Enquiry
              </h2>

              <AnimatePresence mode="wait">
                {formError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
                    <ShieldAlert size={18} className="inline mr-2" /> {formError}
                  </motion.div>
                )}
                {formSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold mb-6 border border-emerald-100">
                    {formSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Name *" name="name" icon={<UserIcon size={18}/>} value={formData.name} onChange={handleFormChange} placeholder="John Doe" />
                  <FormInput label="Email *" name="email" type="email" icon={<Mail size={18}/>} value={formData.email} onChange={handleFormChange} placeholder="john@example.com" />
                </div>

                <FormInput label="Phone" name="phone" icon={<Phone size={18}/>} value={formData.phone} onChange={handleFormChange} placeholder="+91 00000 00000" />

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                    <MessageSquare size={14}/> Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-semibold placeholder:text-slate-300 resize-none"
                    placeholder="Tell us what you need..."
                  />
                </div>

                <button
                  onClick={handleFormSubmit}
                  disabled={formLoading}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-[#FFD700] py-5 rounded-2xl font-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {formLoading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/> 
                      Send Message
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
                Latest Inquiries
              </h2>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                [1, 2, 3].map((n) => <div key={n} className="h-40 w-full bg-slate-100 animate-pulse rounded-[2rem]" />)
              ) : enquiries.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">No data found</div>
              ) : (
                enquiries.map((enq, idx) => (
                  <motion.div
                    key={enq.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-amber-200 transition-all border-l-4 border-l-[#FFD700]"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={12} className="text-amber-500" />
                        {new Date(enq.created_at).toLocaleDateString("en-GB")}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">#ENQ-{enq.id}</span>
                    </div>

                    <div className="mb-5">
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-1">
                        "{enq.message}"
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">Sent by {enq.name}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl relative overflow-hidden group/lock border border-slate-100">
                      <div className="flex flex-col gap-1 opacity-20 select-none">
                        <div className="flex items-center gap-2"><Lock size={12} /><span className="text-[11px] font-black blur-[4px]">{enq.email}</span></div>
                      </div>
                      <button 
                        onClick={() => window.location.href='/user/subscription-plans'}
                        className="absolute inset-0 w-full h-full bg-slate-900/0 hover:bg-slate-900 transition-all flex items-center justify-center opacity-0 hover:opacity-100 text-[10px] font-black text-[#FFD700] uppercase tracking-widest gap-2"
                      >
                        <Lock size={12} /> Unlock Details
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