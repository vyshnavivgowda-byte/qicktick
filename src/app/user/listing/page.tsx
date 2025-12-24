"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  ShoppingBag, 
  Sparkles, 
  Search,
  Tag,
  History
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("vendor_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const productsWithUrls = data.map((p) => {
        let imageUrl = null;
        if (p.product_image) {
          const { data: urlData } = supabase.storage
            .from("products") 
            .getPublicUrl(p.product_image);
          imageUrl = urlData.publicUrl;
        }
        return { ...p, product_image: imageUrl };
      });

      setProducts(productsWithUrls);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
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
              <ShoppingBag size={40} className="text-slate-900" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900"
          >
            Vendor Marketplace
          </motion.h1>
          
          <p className="text-slate-800 text-lg max-w-2xl mx-auto opacity-90 font-semibold flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            Discover premium products from verified local sellers.
          </p>
        </div>
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {/* --- SEARCH & FILTERS BAR --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-yellow-900/5 border border-slate-100 mb-12 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition-all font-bold text-slate-700"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
            <History size={18} className="text-amber-600" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-700">
              {filteredProducts.length} Items Found
            </span>
          </div>
        </motion.div>

        {/* --- PRODUCTS GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            <p className="mt-4 font-black text-slate-400 uppercase tracking-tighter">Updating Catalog...</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-yellow-900/10 transition-all duration-500 flex flex-col h-full"
                >
                  {/* Image Section */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-50">
                    {product.product_image ? (
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                        <Package size={48} strokeWidth={1} />
                        <span className="text-[10px] font-black mt-2 tracking-widest uppercase">No Preview</span>
                      </div>
                    )}

                    {/* Badge Overlay */}
                    <div className="absolute top-5 left-5">
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border ${
                        product.is_active 
                          ? "bg-emerald-500/90 text-white border-emerald-400" 
                          : "bg-slate-800/90 text-white border-slate-700"
                      }`}>
                        {product.is_active ? "In Stock" : "Unavailable"}
                      </div>
                    </div>

                    {/* Floating Price */}
                    <div className="absolute bottom-5 right-5 bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                      <p className="text-slate-900 font-black text-lg flex items-center gap-1">
                        <span className="text-amber-500 text-sm">₹</span>
                        {Number(product.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
                        <Tag size={12} />
                        Premium Listing
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {product.product_name}
                      </h3>
                    </div>

                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                      {product.description || "A high-quality verified product from our trusted vendor network."}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Listed</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                          <Calendar size={12} className="text-amber-500" />
                          {new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <button className="bg-slate-900 text-[#FFD700] p-4 rounded-2xl hover:bg-black transition-all active:scale-90 shadow-lg shadow-slate-200 group/btn">
                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200"
          >
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Package size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">No products found</h2>
            <p className="text-slate-400 font-medium">Try adjusting your search filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}