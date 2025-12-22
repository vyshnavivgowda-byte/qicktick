"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Video, 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Link,
  Type,
  RefreshCw,
  Loader2,
  Mic2,
  PlayCircle,
  ExternalLink,
  Edit3
} from "lucide-react";

export default function PodcastAdminPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); 
  const [file, setFile] = useState<File | null>(null);

  const BUCKET_NAME = "podcasts";

  const fetchPodcasts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcast_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPodcasts(); }, []);

  // Open Modal for New Entry
  const openAddModal = () => {
    setEditingPodcast(null);
    setTitle("");
    setVideoUrl("");
    setFile(null);
    setShowModal(true);
  };

  // Open Modal for Editing Existing Entry
  const openEditModal = (podcast: any) => {
    setEditingPodcast(podcast);
    setTitle(podcast.title);
    setVideoUrl(podcast.video_url); // Populate current URL
    setFile(null); // Reset file selection
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title) return alert("Please enter a title");
    
    setActionLoading(true);
    let finalUrl = videoUrl;

    try {
      // 1. Handle File Upload (if a new file is selected)
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        finalUrl = publicUrlData.publicUrl;
      }

      if (editingPodcast) {
        // 2. Update Existing Record
        const { error: updateError } = await supabase
          .from("podcast_videos")
          .update({ title, video_url: finalUrl })
          .eq("id", editingPodcast.id);

        if (updateError) throw updateError;
        alert("Podcast Updated Successfully!");
      } else {
        // 3. Insert New Record
        if (!finalUrl) return alert("Please provide a URL or select a file");
        
        const { error: insertError } = await supabase
          .from("podcast_videos")
          .insert([{ title, video_url: finalUrl }]);

        if (insertError) throw insertError;
        alert("Podcast Published Successfully!");
      }

      setShowModal(false);
      fetchPodcasts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this podcast episode?")) return;
    const { error } = await supabase.from("podcast_videos").delete().eq("id", id);
    if (!error) setVideos(videos.filter((v) => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Mic2 size={14} /> Studio Broadcasts
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Podcast <span className="text-red-600">Manager</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Distribute video episodes and external sessions.</p>
          </div>

          <div className="flex gap-3">
             <button onClick={fetchPodcasts} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             <button
                onClick={openAddModal}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                New Episode
              </button>
          </div>
        </div>

        {/* EPISODES GRID */}
        {loading ? (
          <div className="bg-white rounded-[3rem] p-32 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Loading Episodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                  <video 
                    src={video.video_url} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="text-white/20 group-hover:text-red-600 transition-colors" size={64} strokeWidth={1} />
                  </div>

                  {/* Float Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => openEditModal(video)} 
                      className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-xl transition-all"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => deleteVideo(video.id)} 
                      className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] text-white font-black uppercase flex items-center gap-2">
                       <ExternalLink size={10} /> External Link
                    </div>
                  ) : null}
                </div>

                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-red-600 transition-colors truncate max-w-[200px]">
                      {video.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                      Recorded: {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <Video size={16} className="text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {videos.length === 0 && !loading && (
          <div className="text-center p-20 bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Mic2 className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-bold">No episodes found.</p>
          </div>
        )}
      </div>

      {/* PUBLISH/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    {editingPodcast ? "Update Mode" : "Broadcasting Console"}
                </p>
                <h3 className="text-2xl font-black tracking-tight">
                    {editingPodcast ? "Edit Episode Info" : "Publish New Episode"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Type size={12} className="text-red-600" /> Podcast Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Episode 42: The Future of Growth"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Link size={12} className="text-red-600" /> Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  disabled={!!file}
                  placeholder="Paste YouTube or Vimeo Link"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-sm disabled:opacity-50"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase">Or Replace with File</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div 
                onClick={() => document.getElementById('podFile')?.click()}
                className={`relative h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                  ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
              >
                {file ? (
                  <div className="text-center">
                    <PlayCircle size={24} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-xs font-black text-emerald-700 truncate px-4">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select New Video File</p>
                  </div>
                )}
                <input id="podFile" type="file" accept="video/*" className="hidden" onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setVideoUrl("");
                }} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-20 active:scale-95"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editingPodcast ? "Update Episode" : "Publish Episode"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}