"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  CheckCircle, Video, Camera, Building2, X, Trash2, 
  Check, ArrowRight, ArrowLeft, UploadCloud, ShieldCheck, 
  Globe, MapPin, Briefcase, Star 
} from "lucide-react";

// Razorpay global object
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  { name: "Bronze", price: "₹7,080.00", duration: "3 MONTHS", calculation: "6000 + 18% (7080)", color: "bg-orange-50 border-orange-200 text-orange-800", iconColor: "text-orange-600", benefits: ["Catalogue Website", "Photos and Videos", "Verified", "Visibility", "Unlimited Enquiries", "Unlimited Leads"] },
  { name: "Silver", price: "₹11,800.00", duration: "8 MONTHS", calculation: "10000 + 18% (11800)", color: "bg-slate-50 border-slate-200 text-slate-800", iconColor: "text-slate-600", benefits: ["Catalogue Website", "Photos and Videos", "Verified", "Visibility", "Unlimited Enquiries", "Unlimited Leads", "Silver Star (✫)", "Digital Banner"] },
  { name: "Gold", price: "₹21,240.00", duration: "1 YEAR", calculation: "18000 + 18% (21,240)", popular: true, color: "bg-yellow-50 border-yellow-300 text-yellow-900", iconColor: "text-yellow-600", benefits: ["Catalogue Website", "Photos and Videos", "Verified", "Visibility", "Unlimited Enquiries", "Unlimited Leads", "Gold Stars (✫✫✫)", "Digital Banner", "ROI", "References", "SMPL (12 Videos)", "Account Manager (Tele)"] },
  { name: "Platinum", price: "₹30,680.00", duration: "2 YEAR", calculation: "26000 + 18% (30,680)", color: "bg-red-50 border-red-200 text-red-900", iconColor: "text-red-600", benefits: ["Catalogue Website", "Photos and Videos", "Verified", "Visibility", "Unlimited Enquiries", "Unlimited Leads", "Medal (🥇🥈🥉)", "Digital Banner", "ROI", "References", "SMPL (36 Videos)", "Account Manager (Direct)"] },
  { name: "Diamond", price: "₹165,200.00", duration: "Lifetime", calculation: "140000 + 18% (165,200)", color: "bg-red-50 border-red-200 text-red-900", iconColor: "text-red-600", benefits: ["Catalogue Website", "Photos and Videos", "Verified", "Visibility", "Unlimited Enquiries", "Unlimited Leads", "Infinity (∞)", "Digital Banner", "ROI", "References", "SMPL (52 Videos)", "Account Manager (Direct)"] }
];

export default function VendorRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userType, setUserType] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessKeywords, setBusinessKeywords] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  const phoneRegex = /^[0-9]{10}$/;
  const pincodeRegex = /^[0-9]{6}$/;

  const handleNumericInput = (val: string, length: number, setter: (v: string) => void) => {
    const numericValue = val.replace(/[^0-9]/g, "");
    if (numericValue.length <= length) setter(numericValue);
  };

  const isStep1Valid = email.includes("@") && password.length >= 6 && password === confirmPassword;
  const isStep2Valid = ownerName.trim() !== "" && phoneRegex.test(mobileNumber) && gstNumber.length > 0;
  const isStep3Valid = houseNo && street && city && state && pincodeRegex.test(pincode);
  const isStep4Valid = companyName && logo && userType && businessType && businessKeywords;
  const isStep5Valid = (mediaFiles.length > 0 || videoFiles.length > 0); 

  const canGoNext = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    if (step === 4) return isStep4Valid;
    return true; 
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  const removeMedia = (index: number) => setMediaFiles(prev => prev.filter((_, i) => i !== index));
  const removeVideo = (index: number) => setVideoFiles(prev => prev.filter((_, i) => i !== index));

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const finalizeRegistration = async (paymentId: string) => {
    try {
      const mediaBase64 = await Promise.all(mediaFiles.map(toBase64));
      const videoBase64 = await Promise.all(videoFiles.map(toBase64));
      const logoBase64 = logo ? await toBase64(logo) : null;
      const fullAddress = `${houseNo}, ${street}, ${area}, ${city}, ${state} - ${pincode}`;

      const { error } = await supabase.from("vendor_register").insert([{
        email, password, owner_name: ownerName, mobile_number: mobileNumber,
        alternate_number: alternateNumber, gst_number: gstNumber, address: fullAddress,
        city, state, pincode, company_name: companyName, company_logo: logoBase64,
        website, sector: userType, business_type: businessType, business_keywords: businessKeywords,
        media_files: mediaBase64, video_files: videoBase64, subscription_plan: subscriptionPlan,
        payment_id: paymentId,
      }]);

      if (error) throw error;
      alert("Registration Successful!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: existingUser } = await supabase.from("vendor_register").select("email").eq("email", email).single();
      if (existingUser) {
        alert("Email already exists.");
        setLoading(false);
        return;
      }

      if (subscriptionPlan) {
        const selectedPlanData = PLANS.find(p => p.name === subscriptionPlan);
        const amount = Number(selectedPlanData?.price.replace(/[₹,]/g, "")) || 0;

        const options = {
          key: "rzp_test_RpvE2nM5XUTYN7",
          amount: amount * 100,
          currency: "INR",
          name: "Vendor Portal",
          description: `Subscription: ${subscriptionPlan}`,
          handler: (res: any) => finalizeRegistration(res.razorpay_payment_id),
          prefill: { name: ownerName, email, contact: mobileNumber },
          theme: { color: "#dc2626" },
          modal: { ondismiss: () => setLoading(false) }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await finalizeRegistration("free_tier");
      }
    } catch (err: any) {
      alert("Init failed: " + err.message);
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-600 focus:bg-white outline-none transition-all text-slate-800 text-sm placeholder:text-slate-400";
  const labelClass = "block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.1em]";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-12 px-4 font-sans text-slate-900">
      <div className="max-w-6xl w-full grid md:grid-cols-[300px_1fr] bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100">
        
        {/* Sidebar Navigation */}
        <div className="bg-slate-900 p-10 hidden md:flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-600 rounded-full blur-[80px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-yellow-500 rounded-full blur-[80px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                <span className="text-white font-black tracking-tighter text-xl">VENDOR<span className="text-red-500">PRO</span></span>
            </div>

            <nav className="space-y-8">
              {[
                { s: 1, label: "Account Info", icon: <ShieldCheck size={18}/> },
                { s: 2, label: "Business Contact", icon: <Briefcase size={18}/> },
                { s: 3, label: "Global Location", icon: <MapPin size={18}/> },
                { s: 4, label: "Company Brand", icon: <Globe size={18}/> },
                { s: 5, label: "Growth Plan", icon: <Star size={18}/> },
              ].map((item) => (
                <div key={item.s} className={`flex items-center gap-4 transition-all duration-300 ${step === item.s ? "translate-x-2" : "opacity-40"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${step === item.s ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {step > item.s ? <Check size={14} /> : item.s}
                  </div>
                  <span className={`text-sm font-bold ${step === item.s ? "text-white" : "text-slate-400"}`}>{item.label}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="relative z-10 pt-10 border-t border-slate-800">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Support Line</p>
             <p className="text-white font-medium text-sm">+91 1800-VENDOR-00</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-16 flex flex-col min-h-[700px]">
          <div className="flex-1">
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create <span className="text-red-600 font-outline-2">Account</span></h2>
                  <p className="text-slate-500 mt-2 font-medium">Secure your vendor dashboard credentials.</p>
                </header>
                <div className="space-y-6">
                  <div>
                      <label className={labelClass}>Corporate Email Address</label>
                      <input type="email" placeholder="e.g. contact@business.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Access Password</label>
                      <input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Verify Password</label>
                      <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Contact <span className="text-red-600">Verification</span></h2>
                  <p className="text-slate-500 mt-2 font-medium">Verified contact details for buyer enquiries.</p>
                </header>
                <div className="space-y-6">
                  <div>
                      <label className={labelClass}>Full Legal Name (Owner)</label>
                      <input type="text" placeholder="As per PAN or Aadhaar" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Primary Mobile</label>
                      <input type="tel" placeholder="10-digit mobile" value={mobileNumber} onChange={(e) => handleNumericInput(e.target.value, 10, setMobileNumber)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>WhatsApp Business (Optional)</label>
                      <input type="tel" placeholder="For instant leads" value={alternateNumber} onChange={(e) => handleNumericInput(e.target.value, 10, setAlternateNumber)} className={inputClass} />
                    </div>
                  </div>
                  <div>
                      <label className={labelClass}>Tax Registration (GSTIN)</label>
                      <input type="text" placeholder="15-character GST number" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} className={inputClass + " uppercase font-mono tracking-widest"} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Business <span className="text-red-600">Base</span></h2>
                  <p className="text-slate-500 mt-2 font-medium">Pin your warehouse or office location.</p>
                </header>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                      <label className={labelClass}>Bldg / Suite / Shop</label>
                      <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} className={inputClass} />
                  </div>
                  <div className="md:col-span-1">
                      <label className={labelClass}>Street & Landmark</label>
                      <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                      <label className={labelClass}>Locality / Area</label>
                      <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                      <label className={labelClass}>State</label>
                      <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                      <label className={labelClass}>Pincode</label>
                      <input type="tel" value={pincode} onChange={(e) => handleNumericInput(e.target.value, 6, setPincode)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Profile */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Brand <span className="text-red-600">Identity</span></h2>
                  <p className="text-slate-500 mt-2 font-medium">How your company appears to the market.</p>
                </header>
                
                <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-red-500/50 transition-all group">
                  <div className="relative h-28 w-28 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    {logo ? <img src={URL.createObjectURL(logo)} className="object-cover w-full h-full" alt="Logo" /> : <Building2 size={32} className="text-slate-200" />}
                  </div>
                  <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Corporate Logo</h4>
                      <p className="text-xs text-slate-500 mb-4">High resolution PNG or JPG (Max 2MB)</p>
                      <label className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10">
                          <UploadCloud size={16} /> {logo ? "Update Logo" : "Upload Logo"}
                          <input type="file" hidden accept="image/*" onChange={(e) => e.target.files && setLogo(e.target.files[0])} />
                      </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                      <label className={labelClass}>Company Display Name</label>
                      <input type="text" placeholder="Your Brand Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Market Sector</label>
                      <select value={userType} onChange={(e) => setUserType(e.target.value)} className={inputClass}>
                          <option value="">Select Sector</option>
                          <option value="Manufacturer">Manufacturer</option>
                          <option value="Wholesaler">Wholesaler</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Legal Entity Type</label>
                      <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={inputClass}>
                          <option value="">Select Type</option>
                          <option value="Proprietorship">Proprietorship</option>
                          <option value="Private Ltd">Private Ltd</option>
                      </select>
                    </div>
                  </div>
                  <div>
                      <label className={labelClass}>Search Keywords</label>
                      <input type="text" placeholder="Textiles, Furniture, Raw Materials etc." value={businessKeywords} onChange={(e) => setBusinessKeywords(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Portfolio */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Final <span className="text-red-600">Submission</span></h2>
                  <p className="text-slate-500 mt-2 font-medium">Upload your showcase and select your membership.</p>
                </header>

                <div className="grid grid-cols-2 gap-6">
                  <label className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center cursor-pointer hover:border-red-600 hover:bg-red-50/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all flex items-center justify-center mb-4 text-slate-500">
                      <Camera size={32} />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Gallery Photos</span>
                    <input type="file" multiple hidden accept="image/*" onChange={(e) => e.target.files && setMediaFiles([...mediaFiles, ...Array.from(e.target.files)])} />
                  </label>
                  <label className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center cursor-pointer hover:border-red-600 hover:bg-red-50/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all flex items-center justify-center mb-4 text-slate-500">
                      <Video size={32} />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Product Videos</span>
                    <input type="file" multiple hidden accept="video/*" onChange={(e) => e.target.files && setVideoFiles([...videoFiles, ...Array.from(e.target.files)])} />
                  </label>
                </div>

                {/* Media Previews */}
                {(mediaFiles.length > 0 || videoFiles.length > 0) && (
                  <div className="flex flex-wrap gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    {mediaFiles.map((file, index) => (
                      <div key={`img-${index}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        <button onClick={() => removeMedia(index)} className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {videoFiles.map((file, index) => (
                      <div key={`vid-${index}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-900 flex items-center justify-center">
                        <Video className="text-white/40" size={20} />
                        <button onClick={() => removeVideo(index)} className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    onClick={() => setShowPlans(true)} 
                    className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all border-2 flex items-center justify-center gap-3 ${subscriptionPlan ? "border-red-600 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-900"}`}
                  >
                    {subscriptionPlan ? <><CheckCircle size={20}/> Member Plan: {subscriptionPlan}</> : "Choose Membership Tier"}
                  </button>
                  {subscriptionPlan && (
                    <button onClick={() => setSubscriptionPlan("")} className="mt-4 text-[10px] text-slate-400 font-bold hover:text-red-600 mx-auto block transition-colors tracking-widest uppercase underline underline-offset-4">
                      Remove Plan & Register as Basic
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-4">
            {step > 1 && (
              <button onClick={handleBack} className="flex items-center gap-2 py-4 px-8 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                <ArrowLeft size={18} /> Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={handleNext} disabled={!canGoNext()} className="ml-auto flex items-center gap-3 py-5 px-10 bg-slate-900 hover:bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10 disabled:opacity-20 transition-all group">
                Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !isStep5Valid} className="ml-auto flex items-center gap-3 py-5 px-12 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-600/20 disabled:opacity-20 transition-all">
                {loading ? "Processing Request..." : <><CheckCircle size={18} /> Complete Registration</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <button onClick={() => setShowPlans(false)} className="absolute top-8 right-8 z-10 p-3 bg-slate-100 rounded-full hover:bg-red-600 hover:text-white transition-all"><X size={20} /></button>
            
            <div className="p-12 md:p-16 overflow-y-auto">
              <div className="text-center mb-16">
                 <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Elevate Your <span className="text-red-600">Presence</span></h3>
                 <p className="text-slate-500 font-medium max-w-xl mx-auto">Select the membership plan that best fits your business goals and scale your reach to thousands of buyers.</p>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                {PLANS.map((plan) => (
                  <div key={plan.name} className={`relative rounded-[2rem] border-2 p-8 flex flex-col transition-all duration-300 hover:shadow-2xl ${subscriptionPlan === plan.name ? 'border-red-600 bg-red-50/30' : 'border-slate-100 bg-white'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Market Choice</div>
                    )}
                    
                    <div className="mb-8">
                        <h4 className={`text-xs font-black mb-4 uppercase tracking-[0.2em] ${plan.iconColor}`}>{plan.name}</h4>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{plan.price.split('.')[0]}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">{plan.duration}</p>
                    </div>

                    <div className="flex-1 space-y-4 mb-10">
                      {plan.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check size={14} className={`${plan.iconColor} shrink-0 mt-0.5`} strokeWidth={4} />
                          <span className="text-[11px] font-bold text-slate-600 leading-tight">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => { setSubscriptionPlan(plan.name); setShowPlans(false); }}
                      className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-red-600 text-white' : 'bg-slate-900 text-white hover:bg-red-600'}`}
                    >
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}