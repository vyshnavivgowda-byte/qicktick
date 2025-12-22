"use client";

import { useEffect, useState } from "react";
import { Search, ListPlus, Send, Star, Award, Users } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
    const [find, setFind] = useState("");
    const [near, setNear] = useState("");
    const [categories, setCategories] = useState([]);
    const [helpAndEarn, setHelpAndEarn] = useState([]);
    const [loading, setLoading] = useState(true);
    const [businessType, setBusinessType] = useState("");
    const [brandingVideos, setBrandingVideos] = useState([]);
    const [imageBanners, setImageBanners] = useState([]);
    const router = useRouter();

    const [podcasts, setPodcasts] = useState([]);
    const [influencers, setInfluencers] = useState([]);
    const [certificates, setCertificates] = useState([]);

    // Fetch Podcasts & Influencers
    useEffect(() => {
        const loadExtraMedia = async () => {
            const { data: podcastData } = await supabase
                .from("podcast_videos")
                .select("*")
                .order("created_at", { ascending: false });

            const { data: influencerData } = await supabase
                .from("influencers_videos")
                .select("*")
                .order("created_at", { ascending: false });

            setPodcasts(podcastData || []);
            setInfluencers(influencerData || []);
        };

        loadExtraMedia();
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name");

            if (!error) setCategories(data);
            setLoading(false);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadHomeMedia = async () => {
            const { data: videos } = await supabase
                .from("digital_branding_videos")
                .select("*")
                .order("created_at", { ascending: false });

            const { data: banners } = await supabase
                .from("digital_banners")
                .select("*")
                .order("created_at", { ascending: false });

            setBrandingVideos(videos || []);
            setImageBanners(banners || []);
        };

        loadHomeMedia();
    }, []);

    // Fetch Help & Earn
    useEffect(() => {
        const loadHelpAndEarn = async () => {
            const { data, error } = await supabase
                .from("help_and_earn")
                .select("*")
                .order("id", { ascending: true });

            if (!error) setHelpAndEarn(data || []);
        };
        loadHelpAndEarn();
    }, []);

    useEffect(() => {
        const loadCertificates = async () => {
            const { data, error } = await supabase
                .from("certificates")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) setCertificates(data || []);
        };

        loadCertificates();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50 text-black">
            {/* HERO SECTION */}
            <div className="relative w-full h-[500px] overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    className="absolute w-full h-full object-cover opacity-40"
                >
                    <source src="/home_video.mp4" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20"></div>

                <div className="relative z-10 text-center pt-28 px-4">
                    <h1 className="text-black text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                        Find Trusted Local Services <span className="text-red-600">Instantly</span>
                    </h1>
                    <p className="text-gray-800 max-w-3xl mx-auto text-xl font-medium">
                        Search from AC Repair, Plumbing, Transport, Interiors, Electrical & More. <span className="text-yellow-600 font-bold">Get Connected Now!</span>
                    </p>

                    {/* SEARCH BAR */}
                    <div className="mt-12 max-w-6xl mx-auto bg-white shadow-2xl p-8 rounded-2xl border-2 border-yellow-300 flex flex-col md:flex-row gap-6 items-end">
                        {/* FIND */}
                        <div className="flex flex-col w-full">
                            <label className="font-bold text-gray-700 mb-2">Find</label>
                            <input
                                className="p-4 border-2 rounded-xl border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                placeholder="AC, Plumbing, Transport..."
                                value={find}
                                onChange={(e) => setFind(e.target.value)}
                            />
                        </div>

                        {/* NEAR */}
                        <div className="flex flex-col w-full">
                            <label className="font-bold text-gray-700 mb-2">Near</label>
                            <select
                                className="p-4 border-2 rounded-xl border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                value={near}
                                onChange={(e) => setNear(e.target.value)}
                            >
                                <option value="">Select City</option>
                                <option>Delhi</option>
                                <option>Mumbai</option>
                                <option>Bangalore</option>
                            </select>
                        </div>

                        {/* BUSINESS TYPE DROPDOWN */}
                        <div className="flex flex-col w-full md:w-[240px]">
                            <label className="font-bold text-gray-700 mb-2">Type</label>
                            <select
                                className="p-4 border-2 rounded-xl border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="Distributer">Distributer</option>
                                <option value="Manufacturer">Manufacturer</option>
                                <option value="Retailers">Retailers</option>
                                <option value="Service Sector">Service Sector</option>
                                <option value="Wholesaler">Wholesaler</option>
                            </select>
                        </div>

                        {/* SEARCH BUTTON */}
                        <button
                            className="bg-gradient-to-r from-yellow-500 to-red-500 text-white font-bold px-12 py-4 rounded-xl hover:from-yellow-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full md:w-auto"
                        >
                            <Search className="inline w-5 h-5 mr-2" /> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <section className="py-28 bg-gradient-to-b from-red-50 to-yellow-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-center text-5xl font-extrabold text-gray-900 mb-6">
                        How <span className="text-red-600">QickTick</span> Works
                    </h2>
                    <p className="text-center text-gray-700 mt-6 mb-20 max-w-2xl mx-auto text-xl">
                        Discover, compare and connect with trusted local businesses in minutes. <span className="text-yellow-600 font-semibold">Simple & Fast!</span>
                    </p>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Search,
                                title: "Search Services",
                                desc: "Find verified service providers near your location instantly.",
                                color: "from-yellow-400 to-yellow-600"
                            },
                            {
                                icon: ListPlus,
                                title: "Compare Providers",
                                desc: "Compare pricing, services & reviews before choosing.",
                                color: "from-red-400 to-red-600"
                            },
                            {
                                icon: Send,
                                title: "Connect & Hire",
                                desc: "Contact businesses directly and get the job done.",
                                color: "from-yellow-400 to-red-600"
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 group hover:border-red-200"
                            >
                                <div className={`w-20 h-20 flex items-center justify-center rounded-3xl bg-gradient-to-r ${item.color} mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <item.icon className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-center text-lg">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POPULAR CATEGORIES */}
            <section className="pt-24 pb-28 bg-gradient-to-b from-white to-red-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
                            Popular <span className="text-yellow-600">Categories</span>
                        </h2>
                        <p className="text-gray-700 mt-6 max-w-3xl mx-auto text-xl">
                            Discover top services trusted by thousands of customers. <span className="text-red-600 font-semibold">Explore Now!</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-12">
                        {loading && (
                            <p className="col-span-full text-center text-gray-500 text-lg">
                                Loading categories...
                            </p>
                        )}

                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => window.location.href = `/user/services/${cat.id}`}
                                className="group relative cursor-pointer"
                            >
                                <div className="relative h-[240px] rounded-3xl overflow-hidden shadow-xl bg-white border-2 border-gray-200 
                        transition-all duration-500 
                        group-hover:shadow-2xl group-hover:-translate-y-4 group-hover:border-red-300"
                                >
                                    {cat.image_url ? (
                                        <Image
                                            src={cat.image_url}
                                            fill
                                            alt={cat.name}
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-sm text-gray-400">
                                            No Image
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                    {cat.hot && (
                                        <span className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-700 text-white text-sm px-4 py-2 rounded-full shadow-lg font-bold">
                                            HOT
                                        </span>
                                    )}

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-white text-xl font-bold leading-tight mb-2">
                                            {cat.name}
                                        </p>
                                        <p className="text-yellow-300 text-sm opacity-0 group-hover:opacity-100 transition font-semibold">
                                            Explore →
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST CTA */}
            <section className="py-28 bg-gradient-to-r from-yellow-500 to-red-500">
                <div className="max-w-6xl mx-auto px-6 text-center text-white">
                    <h2 className="text-5xl font-extrabold mb-8">
                        Are You a <span className="text-red-200">Service Provider?</span>
                    </h2>
                    <p className="text-xl mb-12 max-w-3xl mx-auto">
                        List your business on QickTick and reach customers looking for your services today. <span className="font-bold">Join the Network!</span>
                    </p>
                    <button className="bg-white text-red-600 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                        List Your Business
                    </button>
                </div>
            </section>

            {/* DIGITAL BRANDING */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900">
                                Digital <span className="text-yellow-600">Branding</span>
                            </h2>
                            <p className="text-gray-600 mt-2 text-lg">Showcase your brand with stunning videos</p>
                        </div>
                        <span className="text-red-500 text-3xl hover:text-yellow-500 cursor-pointer transition">→</span>
                    </div>

                    <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-6">
                        {brandingVideos.length === 0 && (
                            <div className="text-gray-400 text-lg italic">
                                No videos uploaded yet
                            </div>
                        )}

                        {brandingVideos.map((video) => (
                            <div
                                key={video.id}
                                className="min-w-[320px] h-[400px] rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 bg-black hover:border-red-300 transition"
                            >
                                <video
                                    src={video.video_url}
                                    autoPlay
                                    muted
                                    loop
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DIGITAL BANNER */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Digital <span className="text-red-600">Banners</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                            Check out our latest promotional banners and visuals. <span className="text-yellow-600 font-semibold">Eye-catching Designs!</span>
                        </p>
                    </div>

                    <div className="overflow-hidden relative">
                        <div className="flex gap-8 animate-slide">
                            {imageBanners.concat(imageBanners).map((banner, idx) => (
                                <div key={idx} className="min-w-[350px] h-[220px] rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 flex-shrink-0 hover:border-yellow-300 transition">
                                    <Image
                                        src={banner.image_url}
                                        alt="Digital Banner"
                                        width={350}
                                        height={220}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TRANSPORT BANNER */}
            <section className="py-24 bg-gradient-to-r from-red-50 to-yellow-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Transport <span className="text-yellow-600">Banner</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                            Explore our latest transport-related promotions. <span className="text-red-600 font-semibold">Get Moving!</span>
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        <div className="w-full max-w-5xl h-[280px] relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200">
                            <Image
                                src="/transport_banner.jpg"
                                alt="Transport Banner"
                                width={1200}
                                height={280}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <button
                            onClick={() => router.push("/user/transport")}
                            className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Go to Transport Services
                        </button>
                    </div>
                </div>
            </section>

            {/* HELP & EARN */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Help & <span className="text-red-600">Earn</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                            Contribute to local initiatives and earn rewards. <span className="text-yellow-600 font-semibold">Make a Difference!</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
                        {helpAndEarn.length === 0 && (
                            <p className="col-span-full text-center text-gray-500 text-lg">No entries available</p>
                        )}

                        {helpAndEarn.map((item) => (
                            <div
                                key={item.id}
onClick={() => router.push(`/user/help`)} // <-- navigate to help page
                                className="relative cursor-pointer group rounded-3xl overflow-hidden shadow-lg border bg-white hover:shadow-2xl transition"
                            >
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        width={300}
                                        height={200}
                                        className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                                        No Image
                                    </div>
                                )}

                                <div className="p-4 text-center">
                                    <p className="text-gray-900 font-semibold">{item.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

           {/* CERTIFICATES SECTION */}
<section className="py-24 bg-gradient-to-b from-white to-red-50">
    <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900">
                Our <span className="text-red-600">Certificates</span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                Celebrating our achievements and recognitions over the years. <span className="text-yellow-600 font-semibold">Excellence Recognized!</span>
            </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {certificates.length === 0 && (
                <p className="col-span-full text-center text-gray-500 text-lg">
                    No certificates available
                </p>
            )}

            {certificates.map((item) => (
                <div
                    key={item.id}
                    className="relative cursor-pointer group rounded-3xl overflow-hidden shadow-xl border-2 border-gray-200 bg-white hover:shadow-2xl hover:border-red-300 transition-all duration-500"
                >
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            width={300}
                            height={200}
                            className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-[180px] bg-gradient-to-br from-yellow-100 to-red-100 text-gray-400 text-sm">
                            No Image
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="p-4 text-center bg-white">
                        <p className="text-gray-900 font-bold text-lg">{item.name}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
</section>

{/* PODCASTS SECTION */}
<section className="py-24 bg-gradient-to-b from-gray-50 to-yellow-50">
    <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-4xl font-extrabold text-gray-900">
                    Latest <span className="text-yellow-600">Podcasts</span>
                </h2>
                <p className="text-gray-600 mt-2 text-lg">Insights from industry experts. <span className="text-red-600 font-semibold">Tune In!</span></p>
            </div>
            <span className="text-red-500 text-3xl hover:text-yellow-500 cursor-pointer transition">→</span>
        </div>

        <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-6">
            {podcasts.length === 0 ? (
                <div className="text-gray-400 text-lg italic">
                    No podcasts available yet
                </div>
            ) : (
                podcasts.map((podcast) => (
                    <div key={podcast.id} className="min-w-[340px] group">
                        <div className="h-[220px] rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 bg-black hover:border-yellow-300 transition relative">
                            <video
                                src={podcast.video_url}
                                controls
                                muted
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <h3 className="mt-4 font-bold text-xl text-gray-800 group-hover:text-red-600 transition">
                            {podcast.title || podcast.name}
                        </h3>
                    </div>
                ))
            )}
        </div>
    </div>
</section>

{/* INFLUENCERS SECTION */}
<section className="py-24 bg-gradient-to-b from-white to-red-50">
    <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-4xl font-extrabold text-gray-900">
                    Our <span className="text-red-600">Influencers</span>
                </h2>
                <p className="text-gray-600 mt-2 text-lg">See what the community is saying. <span className="text-yellow-600 font-semibold">Real Voices!</span></p>
            </div>
            <span className="text-yellow-500 text-3xl hover:text-red-500 cursor-pointer transition">→</span>
        </div>

        <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-6">
            {influencers.length === 0 ? (
                <div className="text-gray-400 text-lg italic">
                    No influencer videos yet
                </div>
            ) : (
                influencers.map((inf) => (
                    <div key={inf.id} className="min-w-[280px] group">
                        <div className="h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-200 relative hover:border-red-300 transition">
                            <video
                                src={inf.video_url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-8">
                                <p className="text-white font-bold text-2xl drop-shadow-lg">{inf.name}</p>
                            </div>
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white text-sm px-3 py-1 rounded-full shadow-lg font-bold opacity-0 group-hover:opacity-100 transition">
                                Watch
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
</section>

        </div>
    );
}