"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Type,
  RefreshCw,
  Loader2,
  Users,
  PlayCircle,
  Edit3,
  Video,
  CheckCircle2
} from "lucide-react";

export default function InfluencerUploadPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const BUCKET = "influencers";

  const fetchData = async () => {
    setLoading(true);
    const { data: list } = await supabase
      .from("influencers_videos")
      .select("*")
      .order("created_at", { ascending: false });
    setData(list || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName("");
    setFile(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter the influencer's name");
    
    setActionLoading(true);
    try {
      let finalUrl = editingItem?.video_url || "";

      // Handle new file upload if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        finalUrl = urlData.publicUrl;
      }

      if (editingItem) {
        // Update
        const { error: dbError } = await supabase
          .from("influencers_videos")
          .update({ name, video_url: finalUrl })
          .eq("id", editingItem.id);
        if (dbError) throw dbError;
      } else {
        // Insert
        if (!finalUrl) throw new Error("Please select a video file");
        const { error: dbError } = await supabase
          .from("influencers_videos")
          .insert([{ name, video_url: finalUrl }]);
        if (dbError) throw dbError;
      }

      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this influencer video?")) return;
    await supabase.from("influencers_videos").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Users size={14} /> Influencer Relations
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Video <span className="text-red-600">Assets</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage partner content and influencer showcases.</p>
          </div>

          <div className="flex gap-3">
             <button onClick={fetchData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             <button
                onClick={openAddModal}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                Upload Content
              </button>
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="bg-white rounded-[3rem] p-32 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Loading Assets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {data.map((item) => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                {/* Video Preview Container */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                  <video 
                    src={item.video_url} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-50 transition-all duration-700"
                    muted
                  />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="text-white/30 group-hover:text-red-600 group-hover:scale-110 transition-all duration-500" size={56} strokeWidth={1} />
                  </div>

                  {/* Float Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => openEditModal(item)} 
                      className="w-11 h-11 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)} 
                      className="w-11 h-11 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Influencer</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-red-600 transition-colors truncate">
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.length === 0 && !loading && (
          <div className="text-center p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Video className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No videos found</p>
          </div>
        )}
      </div>

      {/* UPLOAD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Asset Management</p>
                <h3 className="text-2xl font-black tracking-tight">
                  {editingItem ? "Edit Influencer Info" : "Upload New Feature"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Influencer Name */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Type size={12} className="text-red-600" /> Influencer Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-sm"
                />
              </div>

              {/* Video File Dropzone */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Video Asset</label>
                <div 
                  onClick={() => document.getElementById('infFile')?.click()}
                  className={`relative h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                    ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-red-200'}`}
                >
                  {file ? (
                    <div className="text-center p-4">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-xs font-black text-emerald-700 truncate max-w-[250px]">{file.name}</p>
                      <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">File Selected</p>
                    </div>
                  ) : editingItem && !file ? (
                    <div className="text-center">
                       <Video size={32} className="mx-auto text-slate-300 mb-2" />
                       <p className="text-[10px] font-black text-slate-400 uppercase">Keep Current Video or Upload New</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select MP4/MOV File</p>
                    </div>
                  )}
                  <input id="infFile" type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-20 active:scale-95"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editingItem ? "Update Asset" : "Start Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}