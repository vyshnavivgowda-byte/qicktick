"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Award, 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Type,
  Edit3,
  RefreshCw,
  Search,
  Loader2,
  FileBadge
} from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState<any | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .order("id", { ascending: false });
    setCertificates(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCertificates(); }, []);

  const openAddModal = () => {
    setEditingCert(null);
    setName("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (cert: any) => {
    setEditingCert(cert);
    setName(cert.name);
    setFile(null);
    setPreviewUrl(cert.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter a certificate name");
    setActionLoading(true);

    try {
      let finalImageUrl = editingCert?.image_url || "";

      if (file) {
        // Handle image conversion to Base64 (keeping consistent with your logic)
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
      setActionLoading(false);
    }
  };

  const commitToDatabase = async (imageUrl: string) => {
    if (editingCert) {
      await supabase
        .from("certificates")
        .update({ name: name.trim(), image_url: imageUrl })
        .eq("id", editingCert.id);
    } else {
      if (!imageUrl) throw new Error("Please select a certificate image");
      await supabase.from("certificates").insert({
        name: name.trim(),
        image_url: imageUrl,
      });
    }
    setShowModal(false);
    fetchCertificates();
    setActionLoading(false);
  };

  const deleteCertificate = async (id: number) => {
    if (!confirm("Remove this certificate from the portal?")) return;
    await supabase.from("certificates").delete().eq("id", id);
    fetchCertificates();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Award size={14} /> Credentials & Verification
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Official <span className="text-red-600">Certificates</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage and issue brand-authorized certificates.</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={fetchCertificates}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={openAddModal}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Add Certificate
            </button>
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="bg-white rounded-[3rem] p-32 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Fetching Records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {certificates.map((cert) => (
              <div key={cert.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative h-64 bg-slate-50 overflow-hidden flex items-center justify-center">
                  {cert.image_url ? (
                    <img 
                      src={cert.image_url} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={cert.name}
                    />
                  ) : (
                    <FileBadge size={48} className="text-slate-200" />
                  )}
                  
                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                      onClick={() => openEditModal(cert)}
                      className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-90"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => deleteCertificate(cert.id)}
                      className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault ID: {cert.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-red-600 transition-colors">
                    {cert.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATION/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  {editingCert ? "Modify Certificate" : "New Credential"}
                </p>
                <h3 className="text-2xl font-black tracking-tight">
                  {editingCert ? "Update Details" : "Upload Asset"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors active:scale-90">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Type size={12} className="text-red-600" /> Certificate Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master Distributor Award 2024"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Certificate Preview</label>
                <div 
                  onClick={() => document.getElementById('certFile')?.click()}
                  className={`relative h-56 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden group/upload
                    ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-red-300'}`}
                >
                  {file ? (
                    <div className="text-center p-4">
                      <FileBadge size={32} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-xs font-black text-emerald-700 truncate max-w-[250px]">{file.name}</p>
                      <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase">Ready to Upload</p>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative w-full h-full">
                      <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                        <UploadCloud className="text-white" size={32} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud size={40} className="mx-auto text-slate-300 mb-3 group-hover/upload:text-red-600 transition-colors" />
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Image File</p>
                    </div>
                  )}
                  <input id="certFile" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    setFile(selected);
                    if (selected) setPreviewUrl(URL.createObjectURL(selected));
                  }} />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading || !name}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-20 active:scale-95"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editingCert ? "Update Certificate" : "Publish Certificate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}