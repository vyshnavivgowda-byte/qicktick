"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Video, 
  UploadCloud, 
  Trash2, 
  Play, 
  Plus, 
  X, 
  Film,
  Calendar,
  Type,
  Edit3,
  RefreshCw
} from "lucide-react";

export default function DigitalBranding() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("digital_branding_videos")
      .select("*")
      .order("created_at", { ascending: false });
    setVideos(data || []);
  };

  useEffect(() => { fetchVideos(); }, []);

  const openAddModal = () => {
    setEditingVideo(null);
    setTitle("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (video: any) => {
    setEditingVideo(video);
    setTitle(video.title);
    setFile(null);
    setPreviewUrl(video.video_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalVideoUrl = editingVideo?.video_url || "";

      // 1. Handle File Upload if a new file is selected
      if (file) {
        const fileName = `branding-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("branding-videos")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("branding-videos").getPublicUrl(fileName);
        finalVideoUrl = data.publicUrl;
      }

      if (editingVideo) {
        // 2. Update Existing
        const { error } = await supabase
          .from("digital_branding_videos")
          .update({ title, video_url: finalVideoUrl })
          .eq("id", editingVideo.id);
        if (error) throw error;
      } else {
        // 3. Insert New
        if (!file) throw new Error("Please select a video file");
        const { error } = await supabase
          .from("digital_branding_videos")
          .insert({ title: title || "Untitled Video", video_url: finalVideoUrl });
        if (error) throw error;
      }

      setShowModal(false);
      fetchVideos();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this cinematic asset?")) return;
    await supabase.from("digital_branding_videos").delete().eq("id", id);
    fetchVideos();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Digital <span className="text-red-600">Branding</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Refine your brand's visual identity.</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            New Asset
          </button>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((v) => (
            <div key={v.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="relative h-56 bg-slate-900 overflow-hidden">
                <video src={v.video_url} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                
                {/* Float Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => openEditModal(v)} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-xl transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteVideo(v.id)} className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Video size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Branding Clip</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 truncate">{v.title}</h3>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                  <Calendar size={12} />
                  {new Date(v.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHARED MODAL (Add & Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  {editingVideo ? "Modification Mode" : "Creation Mode"}
                </p>
                <h3 className="text-2xl font-black tracking-tight">
                  {editingVideo ? "Edit Video Info" : "Upload New Asset"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2"><Type size={12} /> Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cinematic Trailer..."
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Media File</label>
                <div 
                  onClick={() => document.getElementById('videoFile')?.click()}
                  className={`relative h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                    ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  {file ? (
                    <div className="text-center">
                      <Play size={24} className="mx-auto text-emerald-500 mb-1" />
                      <p className="text-xs font-black text-emerald-700 truncate px-4">{file.name}</p>
                    </div>
                  ) : previewUrl ? (
                    <video src={previewUrl} className="w-full h-full object-cover opacity-40" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] font-black uppercase text-slate-400">Select Video</p>
                    </div>
                  )}
                  <input id="videoFile" type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                {editingVideo && <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase italic">* Leave empty to keep existing video file</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editingVideo ? "Update Asset" : "Launch Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}