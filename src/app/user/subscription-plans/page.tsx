"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { X, Lock, Check, ShieldCheck, Zap, Star, Sparkles } from "lucide-react";

type SubscriptionPlan = {
  id: number;
  name: string;
  base_price: number;
  tax_percent: number;
  duration_months: number;
  benefits: string[];
  color: string | null;
};

export default function SubscriptionPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("base_price", { ascending: true });

    setPlans(data || []);
    setLoading(false);
  };

  const calculateTotal = (base: number, tax: number) =>
    Math.round(base + (base * tax) / 100);

  const handlePayment = async (plan: SubscriptionPlan) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!(window as any).Razorpay) {
      alert("Payment system loading. Try again.");
      return;
    }

    const amount = calculateTotal(plan.base_price, plan.tax_percent);

    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const order = await res.json();

    const razorpay = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Your Brand Name",
      description: `${plan.name} - ${plan.duration_months} Months`,
      order_id: order.id,
      handler: async (response: any) => {
        await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            plan_id: plan.id,
            user_id: user.id,
            amount,
          }),
        });
        router.push("/payment-success");
      },
      theme: { color: "#FFD700" },
    });

    razorpay.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading premium plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* --- AUTH MODAL --- */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full relative z-10 overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-50 text-[#eab308] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Login Required</h2>
                <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">You need to be logged in to subscribe to our premium tiers.</p>
                
             
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- YELLOW HEADER --- */}
      <div className="bg-[#FFD700] pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mb-6">
            <div className="bg-white/40 p-4 rounded-3xl backdrop-blur-md border border-white/50 shadow-sm">
              <Zap size={40} className="text-slate-900" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900">
            Ready to upgrade?
          </motion.h1>
          <p className="text-slate-800 text-lg max-w-2xl mx-auto opacity-90 font-semibold flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            Join our premium network and unlock all features.
          </p>
        </div>
      </div>

      {/* --- PLANS GRID --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const totalPrice = calculateTotal(plan.base_price, plan.tax_percent);
            const perMonth = Math.round(totalPrice / plan.duration_months);
            const isPopular = idx === 1;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className={`relative h-full overflow-hidden border-none shadow-2xl shadow-yellow-900/5 rounded-[2.5rem] bg-white transition-all ${isPopular ? 'ring-4 ring-yellow-400' : ''}`}>
                  {isPopular && (
                    <div className="absolute top-6 right-6 bg-[#FFD700] text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Best Value
                    </div>
                  )}

                  <CardContent className="p-10 flex flex-col h-full">
                    <div className="mb-8">
                      <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-900">₹{totalPrice}</span>
                        <span className="text-slate-400 font-bold text-sm">/ {plan.duration_months}mo</span>
                      </div>
                      <p className="text-[#eab308] font-black text-[11px] uppercase tracking-wider mt-2">
                        ≈ ₹{perMonth} per month
                      </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-grow">
                      {plan.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center">
                            <Check size={12} className="text-amber-600 stroke-[4px]" />
                          </div>
                          <span className="text-slate-600 text-sm font-bold leading-tight">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePayment(plan)}
                      className="w-full py-5 bg-slate-900 hover:bg-black text-[#FFD700] font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isPopular ? <Zap size={18} fill="currentColor" /> : <ShieldCheck size={18} />}
                      Choose {plan.name}
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* --- TRUST FOOTER --- */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-12 text-slate-400">
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><ShieldCheck size={16} className="text-[#FFD700]"/> Secure Payments</div>
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><Star size={16} className="text-[#FFD700]"/> verified carriers</div>
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><Check size={16} className="text-[#FFD700]"/> GST Invoicing</div>
        </div>
      </div>
    </div>
  );
}