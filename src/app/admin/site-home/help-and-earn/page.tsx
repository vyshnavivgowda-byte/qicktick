"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Coins, 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Calendar,
  Type,
  Edit3,
  RefreshCw,
  ChevronRight,
  ImageIcon
} from "lucide-react";

export default function HelpAndEarnAdmin() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("help_and_earn")
      .select("*")
      .order("id", { ascending: true });
    setEntries(data || []);
  };

  useEffect(() => { fetchEntries(); }, []);

  const openAddModal = () => {
    setEditingEntry(null);
    setName("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (entry: any) => {
    setEditingEntry(entry);
    setName(entry.name);
    setFile(null);
    setPreviewUrl(entry.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalImageUrl = editingEntry?.image_url || "";

      // 1. Handle File Upload if a new file is selected
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          finalImageUrl = reader.result as string;
          await commitToDatabase(finalImageUrl);
        };
        reader.readAsDataURL(file);
      } else {
        await commitToDatabase(finalImageUrl);
      }
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const commitToDatabase = async (imageUrl: string) => {
    if (editingEntry) {
      const { error } = await supabase
        .from("help_and_earn")
        .update({ name, image_url: imageUrl })
        .eq("id", editingEntry.id);
      if (error) throw error;
    } else {
      if (!imageUrl) throw new Error("Please select an image");
      const { error } = await supabase
        .from("help_and_earn")
        .insert({ name: name || "New Category", image_url: imageUrl });
      if (error) throw error;
    }
    setShowModal(false);
    fetchEntries();
    setLoading(false);
  };

  const deleteEntry = async (id: number) => {
    if (!confirm("Delete this reward category?")) return;
    await supabase.from("help_and_earn").delete().eq("id", id);
    fetchEntries();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Coins size={14} /> Rewards Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Help <span className="text-red-600">&</span> Earn
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage categories for the reward program.</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            New Category
          </button>
        </div>

        {/* GRID LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {entries.map((entry) => (
            <div key={entry.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-8">
                <img 
                  src={entry.image_url} 
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" 
                  alt={entry.name}
                />
                
                {/* Float Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => openEditModal(entry)} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-xl transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteEntry(entry.id)} className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref: #{entry.id}</span>
                   <ChevronRight size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-black text-slate-900 truncate">{entry.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL (Add & Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  {editingEntry ? "Modification Mode" : "Creation Mode"}
                </p>
                <h3 className="text-2xl font-black tracking-tight">
                  {editingEntry ? "Update Category" : "Add New Reward"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                  <Type size={12} /> Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Share on Facebook"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Category Icon</label>
                <div 
                  onClick={() => document.getElementById('entryFile')?.click()}
                  className={`relative h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                    ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  {file ? (
                    <div className="text-center">
                      <ImageIcon size={24} className="mx-auto text-emerald-500 mb-1" />
                      <p className="text-xs font-black text-emerald-700 truncate px-4">{file.name}</p>
                    </div>
                  ) : previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-contain p-4 opacity-60" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] font-black uppercase text-slate-400">Select Image</p>
                    </div>
                  )}
                  <input id="entryFile" type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editingEntry ? "Update Reward" : "Confirm Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}