"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Monitor,
  Calendar,
  Type,
  Edit3,
  RefreshCw
} from "lucide-react";

export default function DigitalBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("digital_banners")
      .select("*")
      .order("created_at", { ascending: false });
    setBanners(data || []);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setFile(null);
    setPreviewUrl(banner.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalImageUrl = editingBanner?.image_url || "";

      if (file) {
        const fileName = `banner-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("digital-banners")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("digital-banners").getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      if (editingBanner) {
        const { error } = await supabase
          .from("digital_banners")
          .update({ title, image_url: finalImageUrl })
          .eq("id", editingBanner.id);
        if (error) throw error;
      } else {
        if (!file) throw new Error("Please select an image file");
        const { error } = await supabase
          .from("digital_banners")
          .insert({ title: title || "New Campaign Banner", image_url: finalImageUrl });
        if (error) throw error;
      }

      setShowModal(false);
      fetchBanners();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Remove this banner from the website?")) return;
    await supabase.from("digital_banners").delete().eq("id", id);
    fetchBanners();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest mb-2">
              <Monitor size={14} /> Site Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Digital <span className="text-slate-400">Banners</span>
            </h1>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Create Banner
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {banners.map((b) => (
            <div key={b.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="relative h-52 bg-slate-100 overflow-hidden">
                <img 
                  src={b.image_url} 
                  alt={b.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                
                {/* Overlay Tools - Reduced to Edit/Delete only */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => openEditModal(b)} 
                    className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl transform translate-y-2 group-hover:translate-y-0 duration-300"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => deleteBanner(b.id)} 
                    className="p-4 bg-white text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl transform translate-y-2 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 truncate mb-1">
                  {b.title || "Untitled Banner"}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                  <Calendar size={12} />
                  Published {new Date(b.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Hero Asset</p>
                <h3 className="text-2xl font-black tracking-tight">
                  {editingBanner ? "Update Banner" : "New Website Banner"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                   <Type size={12} /> Display Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Sale 2024"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Graphic File</label>
                <div 
                  onClick={() => document.getElementById('bannerFile')?.click()}
                  className={`relative h-48 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                    ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-red-500/50'}`}
                >
                  {file ? (
                    <div className="text-center p-4">
                      <ImageIcon size={32} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-xs font-black text-emerald-700 truncate max-w-[250px]">{file.name}</p>
                    </div>
                  ) : previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud size={40} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-500">Select Banner Image</p>
                    </div>
                  )}
                  <input id="bannerFile" type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editingBanner ? "Save Changes" : "Publish Banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}