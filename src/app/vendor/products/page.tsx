"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  Youtube,
} from "lucide-react";

type MediaItem = {
  url: string;
  type: "image" | "youtube";
};

export default function VendorProductsPage() {
  const router = useRouter();

  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    product_name: "",
    price: "",
    description: "",
  });

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      const stored = localStorage.getItem("vendorData");
      if (!stored) return router.push("/");

      const localVendor = JSON.parse(stored);

      const { data: vendorData } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("email", localVendor.email)
        .maybeSingle();

      if (!vendorData) return;
      setVendor(vendorData);

      const { data } = await supabase
        .from("vendor_products")
        .select("*")
        .eq("vendor_id", vendorData.id)
        .order("created_at", { ascending: false });

      setProducts(data || []);
      setLoading(false);
    };

    loadData();
  }, [router]);

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaList([{ url: reader.result as string, type: "image" }]);
      setYoutubeUrl("");
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- YOUTUBE URL ---------------- */
  const addYoutubeUrl = () => {
    if (!youtubeUrl.trim()) return;

    setMediaList([{ url: youtubeUrl.trim(), type: "youtube" }]);
    setYoutubeUrl("");
  };

  const getYoutubeEmbed = (url: string) => {
    const id =
      url.split("v=")[1]?.split("&")[0] ||
      url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${id}`;
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!productForm.product_name || !productForm.price) {
      alert("Please fill mandatory fields");
      return;
    }

    const payload = {
      vendor_id: vendor.id,
      product_name: productForm.product_name,
      price: Number(productForm.price),
      description: productForm.description,
      product_image: JSON.stringify(mediaList),
    };

    if (editingProduct.id === "new") {
      await supabase.from("vendor_products").insert(payload);
    } else {
      await supabase
        .from("vendor_products")
        .update(payload)
        .eq("id", editingProduct.id);
    }

    resetForm();
    refreshProducts();
  };

  const refreshProducts = async () => {
    const { data } = await supabase
      .from("vendor_products")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({ product_name: "", price: "", description: "" });
    setMediaList([]);
    setYoutubeUrl("");
  };

  const startEdit = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      product_name: p.product_name,
      price: p.price.toString(),
      description: p.description,
    });
    const media = JSON.parse(p.product_image || "[]");
    setMediaList(media);
    if (media[0]?.type === "youtube") setYoutubeUrl(media[0].url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-red-600 rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-yellow-50 px-6 xl:px-20 py-12 space-y-12">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-red-700">
            Inventory <span className="text-yellow-500">Lab</span>
          </h2>
          <p className="text-red-700/60 mt-2 font-medium">
            Manage products with image or video previews
          </p>
        </div>

        {!editingProduct && (
          <button
            onClick={() => {
              setEditingProduct({ id: "new" });
              setProductForm({ product_name: "", price: "", description: "" });
              setMediaList([]);
              setYoutubeUrl("");
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-yellow-400
                       text-white hover:text-red-800 px-8 py-4 rounded-2xl
                       font-black text-xs uppercase tracking-widest transition"
          >
            <PlusCircle size={18} /> New Product
          </button>
        )}
      </div>

      {/* EDITOR */}
      {editingProduct && (
        <div className="bg-white border-4 border-red-600 rounded-[2.5rem]
                        shadow-[20px_20px_0px_rgba(234,179,8,0.3)]">
          <div className="bg-red-600 p-6 flex justify-between text-white">
            <span className="font-black uppercase tracking-widest text-xs">
              {editingProduct.id === "new" ? "New Product" : "Edit Product"}
            </span>
            <button onClick={resetForm}><X /></button>
          </div>

          <div className="p-10 grid lg:grid-cols-3 gap-10">
            {/* MEDIA */}
            <div className="space-y-6">
              <label className="text-xs font-black text-red-600 uppercase">
                Product Media
              </label>

              <div className="aspect-square bg-yellow-50 border-2 border-dashed
                              border-yellow-300 rounded-3xl flex items-center justify-center overflow-hidden relative">
                {mediaList[0]?.type === "image" && (
                  <img src={mediaList[0].url} className="w-full h-full object-cover" />
                )}
                {mediaList[0]?.type === "youtube" && (
                  <iframe
                    src={getYoutubeEmbed(mediaList[0].url)}
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
                {!mediaList.length && (
                  <ImageIcon size={40} className="text-yellow-400" />
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>

              {/* YOUTUBE INPUT */}
              <div className="flex gap-2">
                <input
                  placeholder="YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-yellow-300"
                />
                <button
                  onClick={addYoutubeUrl}
                  className="bg-red-600 text-white px-4 rounded-xl"
                >
                  <Youtube size={18} />
                </button>
              </div>
            </div>

            {/* FORM */}
            <div className="lg:col-span-2 space-y-6">
              <input
                placeholder="Product Name"
                value={productForm.product_name}
                onChange={(e) =>
                  setProductForm({ ...productForm, product_name: e.target.value })
                }
                className="w-full p-4 rounded-2xl border border-yellow-300"
              />

              <input
                type="number"
                placeholder="Price (INR)"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className="w-full p-4 rounded-2xl border border-yellow-300"
              />

              <textarea
                rows={4}
                placeholder="Description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                className="w-full p-4 rounded-2xl border border-yellow-300 resize-none"
              />

              <button
                onClick={handleSave}
                className="px-10 py-5 bg-red-600 hover:bg-yellow-400
                           text-white hover:text-red-800 rounded-2xl
                           font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Save size={16} /> Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((p) => {
          const media = JSON.parse(p.product_image || "[]")[0];
          return (
            <div key={p.id} className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="h-60 bg-yellow-100">
                {media?.type === "image" && (
                  <img src={media.url} className="w-full h-full object-cover" />
                )}
                {media?.type === "youtube" && (
                  <iframe
                    src={getYoutubeEmbed(media.url)}
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="font-black text-red-700">{p.product_name}</h3>
                <p className="text-sm text-red-700/60">{p.description}</p>
                <div className="mt-4 font-black text-yellow-600">₹{p.price}</div>
                <button
                  onClick={() => startEdit(p)}
                  className="mt-4 text-sm font-bold text-red-600"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
