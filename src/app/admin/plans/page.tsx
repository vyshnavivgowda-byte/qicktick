"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Plus, CheckCircle2, Clock, ShieldCheck, Edit3, X } from "lucide-react";

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: "",
        base_price: "",
        tax_percent: "",
        duration_months: "",
        color: "#4F46E5",
    });
    const [benefits, setBenefits] = useState<string[]>([""]);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        const { data, error } = await supabase
            .from("subscription_plans")
            .select("*");

        if (error) {
            console.error("Error fetching plans:", error);
            setLoading(false);
            return;
        }

        // SELF-SORTING LOGIC: Sorts by total price (Base + Tax)
        const sortedData = (data || []).sort((a, b) => {
            const totalA = a.base_price * (1 + (a.tax_percent || 0) / 100);
            const totalB = b.base_price * (1 + (b.tax_percent || 0) / 100);
            return totalA - totalB; // Lowest price first
        });

        setPlans(sortedData);
        setLoading(false);
    };

    const handleEditClick = (plan: any) => {
        setEditingId(plan.id);
        setForm({
            name: plan.name,
            base_price: plan.base_price.toString(),
            tax_percent: plan.tax_percent.toString(),
            duration_months: plan.duration_months.toString(),
            color: plan.color || "#4F46E5",
        });
        setBenefits(plan.benefits || [""]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: "", base_price: "", tax_percent: "", duration_months: "", color: "#4F46E5" });
        setBenefits([""]);
    };

    const handleSave = async () => {
        if (!form.name || !form.base_price || !form.duration_months) return alert("Please fill in the required fields.");

        const payload = {
            name: form.name,
            base_price: Number(form.base_price),
            tax_percent: Number(form.tax_percent || 0),
            duration_months: Number(form.duration_months),
            color: form.color,
            benefits: benefits.filter((b) => b.trim() !== ""),
        };

        let error;
        if (editingId) {
            const res = await supabase.from("subscription_plans").update(payload).eq("id", editingId);
            error = res.error;
        } else {
            const res = await supabase.from("subscription_plans").insert(payload);
            error = res.error;
        }

        if (error) {
            console.error(error);
            alert("Failed to save plan.");
        } else {
            resetForm();
            fetchPlans(); // This triggers the re-sort automatically
        }
    };

    const handleDeletePlan = async (planId: number) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
        if (error) {
            console.error(error);
            alert("Failed to delete plan.");
        } else {
            fetchPlans(); // Re-fetch to ensure order remains correct
        }
    };

    if (loading) return <div className="p-20 text-center font-bold">Loading Management Console...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Plan Management</h1>
                        <p className="text-gray-500 mt-1">Configure your product tiers. Plans automatically sort by price.</p>
                    </div>
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 font-medium"
                        >
                            <X size={18} /> Cancel Editing
                        </button>
                    )}
                </div>

                {/* Creator / Editor Form */}
                <div className={`bg-white rounded-2xl shadow-xl border-2 overflow-hidden transition-all ${editingId ? "border-indigo-500 ring-4 ring-indigo-50" : "border-transparent"}`}>
                    <div className={`${editingId ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700"} px-6 py-4 border-b flex justify-between items-center`}>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                            {editingId ? `Editing Plan: ${form.name}` : "Create New Plan"}
                        </h2>
                        {editingId && <span className="text-xs font-bold uppercase tracking-widest opacity-80">Edit Mode</span>}
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-400">Plan Name</label>
                                    <input
                                        placeholder="e.g. Pro Monthly"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full border-gray-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-400">Accent Color</label>
                                    <div className="flex items-center gap-3 border border-gray-200 p-1.5 rounded-lg">
                                        <input
                                            type="color"
                                            value={form.color}
                                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                                            className="w-8 h-8 rounded cursor-pointer overflow-hidden border-none"
                                        />
                                        <span className="text-sm font-mono text-gray-600 uppercase">{form.color}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-400">Base (₹)</label>
                                    <input
                                        type="number"
                                        value={form.base_price}
                                        onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                                        className="w-full border-gray-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-400">Tax (%)</label>
                                    <input
                                        type="number"
                                        value={form.tax_percent}
                                        onChange={(e) => setForm({ ...form, tax_percent: e.target.value })}
                                        className="w-full border-gray-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-400">Months</label>
                                    <input
                                        type="number"
                                        value={form.duration_months}
                                        onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                                        className="w-full border-gray-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Benefits */}
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400">Included Benefits</label>
                            <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                                {benefits.map((b, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            placeholder="Benefit description..."
                                            value={b}
                                            onChange={(e) => {
                                                const updated = [...benefits];
                                                updated[idx] = e.target.value;
                                                setBenefits(updated);
                                            }}
                                            className="flex-1 border-gray-200 border p-2 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                                            className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setBenefits([...benefits, ""])}
                                className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                            >
                                <Plus size={16} /> Add Benefit
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            className={`md:col-span-4 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${editingId
                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                                }`}
                        >
                            {editingId ? <><Edit3 size={20} /> Update Plan</> : <><ShieldCheck size={20} /> Deploy Subscription Plan</>}
                        </button>
                    </div>
                </div>

                {/* Display Plans - They will render in sorted order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const total = plan.base_price * (1 + (plan.tax_percent || 0) / 100);
                        const isEditing = editingId === plan.id;
                        return (
                            <div key={plan.id} className={`group relative bg-white rounded-3xl p-8 border transition-all duration-300 ${isEditing ? "border-indigo-500 shadow-2xl scale-105 z-10" : "border-gray-100 shadow-sm hover:shadow-xl"}`}>
                                <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl" style={{ backgroundColor: plan.color }} />

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-gray-900">₹{total.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(plan)} className="bg-indigo-50 p-2 rounded-full text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors" title="Edit Plan">
                                            <Edit3 size={18} />
                                        </button>
                                        <button onClick={() => handleDeletePlan(plan.id)} className="bg-red-50 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete Plan">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                                        <Clock size={18} className="text-indigo-500" />
                                        <span>Term: <strong>{plan.duration_months} months</strong></span>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-gray-50">
                                        {plan.benefits?.map((b: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                                                <span className="text-gray-700 text-sm">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full py-3 rounded-xl font-bold text-center text-sm" style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
                                    {isEditing ? "Currently Editing..." : "Active Tier"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}