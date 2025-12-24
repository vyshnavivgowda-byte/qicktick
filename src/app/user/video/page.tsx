"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  X, 
  Film, 
  Clock, 
  Sparkles, 
  Search, 
  ChevronRight, 
  PlayCircle,
  Video
} from "lucide-react";

export default function VideoPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const videos = [
    {
      id: 1,
      title: "How to Maintain Your AC Like a Pro",
      thumbnail: "/thumbnails/ac.mp4",
      duration: "4:32",
      category: "Maintenance",
      views: "1.2k"
    },
    {
      id: 2,
      title: "Car Deep Cleaning – Full Process",
      thumbnail: "/thumbnails/car.mp4",
      duration: "7:21",
      category: "Automotive",
      views: "2.8k"
    },
    {
      id: 3,
      title: "How to Clean Sofa at Home Easily",
      thumbnail: "/thumbnails/sofa.mp4",
      duration: "3:40",
      category: "Home Care",
      views: "950"
    },
  ];

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      {/* --- YELLOW HERO SECTION --- */}
      <div className="bg-[#FFD700] pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex justify-center mb-6"
          >
            <div className="bg-white/40 p-4 rounded-3xl backdrop-blur-md border border-white/50 shadow-sm">
              <Film size={40} className="text-slate-900" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900"
          >
            Video Tutorials
          </motion.h1>
          
          <p className="text-slate-800 text-lg max-w-2xl mx-auto opacity-90 font-semibold flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            Master your home maintenance with our expert guides.
          </p>
        </div>
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {/* --- SEARCH BAR --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-yellow-900/5 border border-slate-100 mb-12 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search for tutorials (e.g. AC, Sofa, Car)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition-all font-bold text-slate-700"
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-900 rounded-2xl text-[#FFD700]">
            <Video size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              {filteredVideos.length} Tutorials
            </span>
          </div>
        </motion.div>

        {/* --- VIDEOS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedVideo(video)}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-yellow-900/10 transition-all duration-500 cursor-pointer flex flex-col h-full"
              >
                {/* Thumbnail Section */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <video
                    src={video.thumbnail}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                      <Play size={28} className="text-black fill-black ml-1" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-5 left-5">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/50 shadow-sm">
                      {video.category}
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-5 right-5 bg-black/80 text-[#FFD700] px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 backdrop-blur-sm border border-slate-700">
                    <Clock size={12} /> {video.duration}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors leading-tight">
                      {video.title}
                    </h3>
                  </div>

                  <p className="text-slate-500 text-sm font-medium mb-8">
                    Tap to watch the full tutorial and learn expert techniques.
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Audience</span>
                      <div className="text-xs font-bold text-slate-700">{video.views} Watching</div>
                    </div>
                    
                    <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:bg-amber-100 transition-colors">
                      Watch Now
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <h2 className="text-2xl font-black text-slate-800">No tutorials found</h2>
            <p className="text-slate-400 font-medium">Try searching for different keywords</p>
          </div>
        )}
      </div>

      {/* --- VIDEO MODAL (Theater Mode) --- */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[999] p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-5xl bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 z-10 bg-[#FFD700] text-black p-3 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                onClick={() => setSelectedVideo(null)}
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="aspect-video w-full">
                <video src={selectedVideo.thumbnail} controls autoPlay className="w-full h-full" />
              </div>

              <div className="p-8 bg-white">
                <span className="text-amber-500 text-xs font-black uppercase tracking-widest mb-2 block">Premium Tutorial</span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{selectedVideo.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}