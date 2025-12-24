"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ListPlus, Send, Star, Award, Users, ChevronRight } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Types for better developer experience
interface MediaItem {
    id: string | number;
    name?: string;
    title?: string;
    image_url?: string;
    video_url?: string;
    hot?: boolean;
}

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    // Search States
    const [find, setFind] = useState("");
    const [near, setNear] = useState("");
    const [businessType, setBusinessType] = useState("");

    // Data States
    const [categories, setCategories] = useState<MediaItem[]>([]);
    const [helpAndEarn, setHelpAndEarn] = useState<MediaItem[]>([]);
    const [brandingVideos, setBrandingVideos] = useState<MediaItem[]>([]);
    const [imageBanners, setImageBanners] = useState<MediaItem[]>([]);
    const [podcasts, setPodcasts] = useState<MediaItem[]>([]);
    const [influencers, setInfluencers] = useState<MediaItem[]>([]);
    const [certificates, setCertificates] = useState<MediaItem[]>([]);

    // Unified Data Fetching
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [
                    { data: cats },
                    { data: podcastVids },
                    { data: influencerVids },
                    { data: brandVids },
                    { data: banners },
                    { data: helpEarn },
                    { data: certs }
                ] = await Promise.all([
                    supabase.from("categories").select("*").order("name"),
                    supabase.from("podcast_videos").select("*").order("created_at", { ascending: false }),
                    supabase.from("influencers_videos").select("*").order("created_at", { ascending: false }),
                    supabase.from("digital_branding_videos").select("*").order("created_at", { ascending: false }),
                    supabase.from("digital_banners").select("*").order("created_at", { ascending: false }),
                    supabase.from("help_and_earn").select("*").order("id", { ascending: true }),
                    supabase.from("certificates").select("*").order("created_at", { ascending: false }),
                ]);

                setCategories(cats || []);
                setPodcasts(podcastVids || []);
                setInfluencers(influencerVids || []);
                setBrandingVideos(brandVids || []);
                setImageBanners(banners || []);
                setHelpAndEarn(helpEarn || []);
                setCertificates(certs || []);
            } catch (error) {
                console.error("Error loading home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Navigation Handlers
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (find) params.append("query", find);
        if (near) params.append("location", near);
        if (businessType) params.append("type", businessType);
        router.push(`/user/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50 text-black">
            
            {/* HERO SECTION */}
            <div className="relative w-full h-[600px] overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute w-full h-full object-cover opacity-30"
                >
                    <source src="/home_video.mp4" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-gray-50"></div>

                <div className="relative z-10 text-center pt-32 px-4">
                    <h1 className="text-black text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                        Find Trusted Local Services <span className="text-red-600">Instantly</span>
                    </h1>
                    <p className="text-gray-700 max-w-3xl mx-auto text-xl font-medium mb-12">
                        Search from AC Repair, Plumbing, Transport, Interiors & More. <span className="text-yellow-600 font-bold">Get Connected Now!</span>
                    </p>

                    {/* SEARCH BAR */}
                    <div className="max-w-6xl mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-8 rounded-3xl border border-yellow-100 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex flex-col w-full text-left">
                            <label className="font-bold text-gray-600 mb-2 ml-1 text-sm uppercase">What are you looking for?</label>
                            <input
                                className="p-4 bg-gray-50 border-2 rounded-2xl border-gray-100 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 transition-all outline-none"
                                placeholder="e.g. Electrician, Painter..."
                                value={find}
                                onChange={(e) => setFind(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col w-full text-left">
                            <label className="font-bold text-gray-600 mb-2 ml-1 text-sm uppercase">Location</label>
                            <select
                                className="p-4 bg-gray-50 border-2 rounded-2xl border-gray-100 focus:border-red-400 focus:bg-white transition-all outline-none"
                                value={near}
                                onChange={(e) => setNear(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                <option>Delhi</option>
                                <option>Mumbai</option>
                                <option>Bangalore</option>
                            </select>
                        </div>

                        <div className="flex flex-col w-full md:w-[240px] text-left">
                            <label className="font-bold text-gray-600 mb-2 ml-1 text-sm uppercase">Business Type</label>
                            <select
                                className="p-4 bg-gray-50 border-2 rounded-2xl border-gray-100 focus:border-red-400 focus:bg-white transition-all outline-none"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="Distributer">Distributer</option>
                                <option value="Manufacturer">Manufacturer</option>
                                <option value="Retailers">Retailers</option>
                                <option value="Wholesaler">Wholesaler</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSearch}
                            className="bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold px-10 py-4 rounded-2xl hover:brightness-110 transition-all duration-300 shadow-lg shadow-red-200 flex items-center justify-center gap-2 group w-full md:w-auto"
                        >
                            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                            How <span className="text-red-600">QickTick</span> Works
                        </h2>
                        <div className="h-1.5 w-24 bg-yellow-400 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Search, title: "Search Services", desc: "Find verified service providers near your location instantly.", color: "bg-yellow-500" },
                            { icon: ListPlus, title: "Compare Providers", desc: "Compare pricing, services & reviews before choosing.", color: "bg-red-500" },
                            { icon: Send, title: "Connect & Hire", desc: "Contact businesses directly and get the job done.", color: "bg-orange-500" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 transition-all duration-300">
                                <div className={`${item.color} w-16 h-16 flex items-center justify-center rounded-2xl mb-6 shadow-lg shadow-gray-200`}>
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POPULAR CATEGORIES */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900">Popular <span className="text-yellow-600">Categories</span></h2>
                            <p className="text-gray-500 mt-2">Discover top services trusted by thousands.</p>
                        </div>
                        <button className="hidden md:flex items-center text-red-600 font-bold gap-2 hover:gap-4 transition-all">
                            View All Categories <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />
                            ))
                        ) : (
                            categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => router.push(`/user/services/${cat.id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative h-56 rounded-3xl overflow-hidden border border-gray-100 shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                fill
                                                alt={cat.name || "Category"}
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="bg-gray-50 h-full flex items-center justify-center text-gray-300">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                        
                                        {cat.hot && (
                                            <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black tracking-widest animate-pulse">HOT</span>
                                        )}

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <p className="text-white font-bold text-lg leading-tight">{cat.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* TRUST CTA */}
            <section className="mx-6 my-10">
                <div className="max-w-7xl mx-auto bg-gradient-to-r from-red-600 to-red-800 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                   <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Are You a Service Provider?</h2>
                        <p className="text-red-100 text-xl mb-10 max-w-2xl mx-auto opacity-90">Join our growing network of professionals and start receiving leads today.</p>
                        <button className="bg-white text-red-600 px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                            List Your Business Free
                        </button>
                   </div>
                </div>
            </section>

            {/* DIGITAL BRANDING (VIDEOS) */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-black">Digital <span className="text-yellow-600">Branding</span></h2>
                        <div className="flex gap-2">
                             <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-white transition">←</div>
                             <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-white transition">→</div>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
                        {brandingVideos.map((video) => (
                            <div key={video.id} className="min-w-[300px] md:min-w-[350px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-xl snap-start border-4 border-white">
                                <video
                                    src={video.video_url}
                                    autoPlay muted loop playsInline
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HELP & EARN */}
            <section className="py-20 bg-gray-900 text-white rounded-t-[4rem]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Help & <span className="text-red-500">Earn</span></h2>
                        <p className="text-gray-400">Contribute to local initiatives and earn rewards.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {helpAndEarn.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => router.push(`/user/help`)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square rounded-3xl overflow-hidden mb-3">
                                    <Image
                                        src={item.image_url || "/placeholder.jpg"}
                                        fill
                                        alt={item.name || "Help"}
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </div>
                                <p className="text-center font-bold text-gray-300 group-hover:text-white transition-colors">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

          {/* INFLUENCERS - REFINED COMPACT DESIGN */}
<section className="py-16 bg-gray-50/50">
    <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Our <span className="text-red-600">Influencers</span>
                </h2>
                <div className="h-1 w-12 bg-red-600 rounded-full mt-1"></div>
            </div>
            <button className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
                See all members →
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {influencers.slice(0, 6).map((inf) => (
                <div 
                    key={inf.id} 
                    className="group relative aspect-square rounded-[1.5rem] overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-gray-100"
                >
                    {/* Video Background */}
                    <video
                        src={inf.video_url}
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />

                    {/* Gradient Overlay (Smarter contrast) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content UI */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        {/* Top Tag */}
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                        {/* Bottom Label */}
                        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <p className="text-white text-xs font-medium opacity-70 mb-0.5">Influencer</p>
                            <h3 className="text-white font-bold text-sm md:text-base leading-tight truncate">
                                {inf.name}
                            </h3>
                        </div>
                    </div>
                    
                    {/* Interactive Border (Glass effect) */}
                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-[1.5rem] transition-colors pointer-events-none" />
                </div>
            ))}
        </div>
    </div>
</section>

            {/* FOOTER-LIKE SPACE */}
            <div className="h-20"></div>
        </div>
    );
}