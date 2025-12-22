"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  UserCheck,
  Key
} from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function SubAdminPage() {
  const [subadmins, setSubadmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchSubAdmins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("role", "subadmin")
      .order("created_at", { ascending: false });

    if (!error) setSubadmins(data || []);
    setLoading(false);
  }, []);

  const addSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const { error } = await supabase.from("admin_users").insert({
      email,
      password,
      role: "subadmin",
    });

    if (!error) {
      setEmail("");
      setPassword("");
      fetchSubAdmins();
    }
    setSubmitting(false);
  };

  useEffect(() => {
    fetchSubAdmins();
  }, [fetchSubAdmins]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
              <ShieldCheck size={14} /> Security Infrastructure
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">
              Admin <span className="text-emerald-600">Access</span>
            </h1>
          </div>
          <button 
            onClick={fetchSubAdmins}
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full hover:border-emerald-600 transition-all text-sm font-bold shadow-sm text-slate-600 hover:text-emerald-600"
          >
            <RefreshCw size={16} className={`${loading ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`} />
            Sync Database
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <UserPlus className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">New Controller</h2>
              <p className="text-slate-500 text-xs mb-8 font-medium">Assign a new sub-admin with limited system privileges.</p>
              
              <form onSubmit={addSubAdmin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="name@studio.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm text-slate-900 transition-all placeholder:text-slate-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm text-slate-900 transition-all placeholder:text-slate-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 disabled:bg-slate-200 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : "Authorize User"}
                </button>
              </form>
            </div>
          </div>

          {/* MAIN LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administrator</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Level</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={3} className="px-8 py-10 h-24 bg-white">
                           <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : subadmins.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-32 text-center">
                        <UserCheck size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-300">Zero Personnel Detected</p>
                      </td>
                    </tr>
                  ) : (
                    subadmins.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50 transition-all">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 font-black text-sm border border-slate-200 shadow-sm group-hover:border-emerald-500/30 transition-colors">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-base tracking-tight">{user.email}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">
                                Hired: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm group-hover:shadow-md">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}