"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  RefreshCw, 
  Search, 
  Mail, 
  Calendar, 
  Clock, 
  UserCheck, 
  Loader2
} from "lucide-react";

export default function CustomerListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/get-users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (data?.users) setUsers(data.users);
        else setUsers([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.user_metadata?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <UserCheck size={14} /> System Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Member <span className="text-red-600">Database</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Monitor registered platform users and their activity.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full sm:w-72 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                />
             </div>
             <button onClick={fetchUsers} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm hover:border-red-200">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>

        {/* MAIN DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Index</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Join Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Login</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                        <Loader2 className="animate-spin text-red-600 mx-auto mb-4" size={40} />
                        <p className="font-black text-xs uppercase tracking-widest text-slate-400">Retrieving Records...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                    <tr>
                    <td colSpan={5} className="p-32 text-center">
                        <Users className="text-slate-200 mx-auto mb-4" size={48} />
                        <p className="font-bold text-slate-400 tracking-widest uppercase text-sm">No members found</p>
                    </td>
                  </tr>
                ) : (
                    filteredUsers.map((u, i) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-6">
                        <span className="text-xs font-black text-slate-300">#{(i + 1).toString().padStart(2, '0')}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-200">
                                {u.user_metadata?.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 leading-none mb-1 text-sm tracking-tight">{u.user_metadata?.name || "Guest User"}</h4>
                                <div className="flex items-center gap-1 text-slate-400 font-bold text-[11px]">
                                    <Mail size={12} className="text-red-500" /> {u.email}
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                            <Clock size={14} className="text-slate-400" />
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "No record"}
                        </div>
                      </td>
                      <td className="p-6">
                        {u.last_sign_in_at ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Inactive
                            </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* TABLE FOOTER / STATS */}
          {!loading && (
            <div className="bg-slate-50/30 p-6 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing {filteredUsers.length} total members
                </p>
                <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm disabled:opacity-30" disabled>Previous</button>
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm disabled:opacity-30" disabled>Next</button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}