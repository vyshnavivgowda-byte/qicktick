"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Send, MessageSquare } from "lucide-react";

export default function VendorEnquiryPage() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* GET LOGGED-IN VENDOR DETAILS */
  useEffect(() => {
    const fetchVendor = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        alert("Please login to access vendor enquiries");
        return;
      }

      setVendorEmail(user.email);

      const { data, error: vendorError } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (vendorError || !data) {
        alert("Vendor profile not found");
        return;
      }

      setVendorId(data.id);
    };

    fetchVendor();
  }, []);

  /* SUBMIT ENQUIRY */
  const submitEnquiry = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("All fields are required");
      return;
    }

    if (!vendorId || !vendorEmail) {
      alert("Vendor details not loaded yet");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("vendor_enquiries").insert({
      vendor_id: vendorId,
      vendor_email: vendorEmail,
      subject,
      message,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Enquiry sent to admin successfully");
      setSubject("");
      setMessage("");
    }
  };

   return (
  <div className="min-h-screen bg-white px-6 md:px-12 xl:px-20 py-12 font-sans">
    <div className="max-w-4xl mx-auto space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black  tracking-tight">
          Vendor <span className="text-yellow-500">Enquiry</span>
        </h1>
        <p className="mt-2 text-red-700/70 font-medium italic max-w-xl">
          Direct communication channel with administration for support and issues.
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-white border-4 border-red-600 rounded-[2.5rem]
                      shadow-[20px_20px_0px_0px_rgba(220,38,38,0.25)]
                      p-10">

        {/* TITLE */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 rounded-full bg-red-600">
            <MessageSquare className="text-yellow-300" size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-red-700">
              Send Enquiry to Admin
            </h2>
            <p className="text-sm text-red-700/60 font-medium">
              Our team will respond shortly
            </p>
          </div>
        </div>

        {/* SUBJECT */}
        <div className="mb-8">
          <label className="block mb-2 text-[11px] font-black uppercase tracking-widest text-red-700/60">
            Subject
          </label>
          <input
            type="text"
            placeholder="Subscription issue / Product approval"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl
                       bg-yellow-50 border-2 border-yellow-300
                       font-bold text-red-800 placeholder:text-red-300
                       focus:border-red-600 focus:ring-4 focus:ring-red-500/20
                       outline-none transition"
          />
        </div>

        {/* MESSAGE */}
        <div className="mb-10">
          <label className="block mb-2 text-[11px] font-black uppercase tracking-widest text-red-700/60">
            Message
          </label>
          <textarea
            rows={6}
            placeholder="Explain your issue clearly..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-5 py-5 rounded-2xl
                       bg-yellow-50 border-2 border-yellow-300
                       font-medium text-red-800 placeholder:text-red-300
                       focus:border-red-600 focus:ring-4 focus:ring-red-500/20
                       outline-none resize-none transition"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={submitEnquiry}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3
                     bg-red-500 hover:bg-yellow-400
                     text-yellow-50 hover:text-red-800
                     py-5 rounded-2xl
                     font-black text-xs uppercase tracking-[0.25em]
                     transition-all shadow-lg shadow-red-200"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Send size={18} />
              Submit Enquiry
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

}
