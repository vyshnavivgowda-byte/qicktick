"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { createClient, User } from "@supabase/supabase-js";
import {
  CreditCard,
  CheckCircle,
  DollarSign,
  User as UserIcon,
  Phone,
  Mail,
  Users,
  Hash,
} from "lucide-react";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Razorpay key
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

interface HelpCategory {
  id: number;
  name: string;
  image_url?: string | null;
}

export default function HelpAndEarn() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: "",
    name: "",
    phone: "",
    email: "",
    referralName: "",
    referralId: "",
    category: "",
    giveAmount: "",
    referralNumber: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    fetchCategories();

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("help_and_earn").select("*");
    if (error) console.error("Error fetching categories:", error);
    else setCategories(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return alert("Please login first");
    if (!(window as any).Razorpay) return alert("Razorpay SDK not loaded. Refresh the page.");

    setPaymentLoading(true);

    try {
      // Create Razorpay order
      const res = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentData.amount) * 100,
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const order = await res.json();
      if (!order.id) throw new Error("Order creation failed");

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "QuickTick Help & Earn",
        description: "Referral Support Payment",
        order_id: order.id,
        handler: async (response: any) => {
          const { error } = await supabase.from("help_payments").insert([
            {
              user_id: user.id,
              amount: Number(paymentData.amount),
              name: paymentData.name,
              phone: paymentData.phone,
              email: paymentData.email,
              referral_name: paymentData.referralName,
              referral_id: paymentData.referralId,
              category: paymentData.category,
              give_amount: paymentData.giveAmount,
              referral_number: paymentData.referralNumber,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
          ]);

          if (error) {
            alert("Payment saved failed!");
            console.error(error);
            return;
          }

          setPaymentSuccess(true);
          setPaymentData({
            amount: "",
            name: "",
            phone: "",
            email: "",
            referralName: "",
            referralId: "",
            category: "",
            giveAmount: "",
            referralNumber: "",
          });
        },
        prefill: {
          name: paymentData.name,
          email: paymentData.email,
          contact: paymentData.phone,
        },
        theme: { color: "#F59E0B" },
        modal: { ondismiss: () => setPaymentLoading(false) },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed", response.error);
        alert(response.error.description);
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Help & Earn</h1>
            <p className="text-lg opacity-90">
              Support others through our referral program and earn rewards.
            </p>
          </div>

          {paymentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 m-8 flex items-center">
              <CheckCircle size={24} className="text-green-600 mr-4" />
              <div>
                <h3 className="text-green-800 font-semibold">Payment Successful!</h3>
                <p className="text-green-600">Your contribution has been recorded. Thank you!</p>
              </div>
            </div>
          )}

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="name" label="Name" value={paymentData.name} onChange={handleChange} icon={<UserIcon size={18} />} />
                <InputField name="phone" label="Phone" value={paymentData.phone} onChange={handleChange} icon={<Phone size={18} />} />
              </div>

              {/* Email & Referral Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="email" label="Email" value={paymentData.email} onChange={handleChange} icon={<Mail size={18} />} type="email" />
                <InputField name="referralName" label="Referral Name" value={paymentData.referralName} onChange={handleChange} icon={<Users size={18} />} />
              </div>

              {/* Referral ID & Referral Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="referralId" label="Referral ID" value={paymentData.referralId} onChange={handleChange} icon={<Hash size={18} />} />
                <InputField name="referralNumber" label="Referral Number" value={paymentData.referralNumber} onChange={handleChange} icon={<Hash size={18} />} />
              </div>

              {/* Category & Give Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Which Category do you want to help</label>
                  <select
                    name="category"
                    value={paymentData.category}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">--Select--</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">How much amount do you want to give</label>
                  <select
                    name="giveAmount"
                    value={paymentData.giveAmount}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">--Select--</option>
                    <option value="100">₹100</option>
                    <option value="500">₹500</option>
                    <option value="1000">₹1000</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <InputField name="amount" label="Amount" value={paymentData.amount} onChange={handleChange} icon={<DollarSign size={18} />} type="number" />
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50 flex items-center justify-center mx-auto shadow-lg"
                >
                  <CreditCard size={20} className="mr-2" />
                  {paymentLoading ? "Processing..." : `Pay ₹${paymentData.amount || "0.00"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Input Component
const InputField = ({ name, label, value, onChange, icon, type = "text" }: any) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
      {icon} {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={`Enter ${label}`}
      required
      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
    />
  </div>
);
