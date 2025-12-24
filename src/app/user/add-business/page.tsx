"use client";

import { useState, useEffect, useRef } from "react";
import {
    Upload,
    MapPin,
    User,
    Building,
    Phone,
    Mail,
    Globe,
    Hash,
    CornerDownRight,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const indiaStatesCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
    Karnataka: ["Bangalore", "Mysore", "Mangalore"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
};

const allStates = Object.keys(indiaStatesCities);

const FormInput = ({ label, value, onChange, error, placeholder, Icon, type = "text", required = true, disabled = false, isSelect = false, options = [], className = "", rows = 1, id }) => (
    <div className={`flex flex-col ${className}`} id={id}>
        <label className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-2 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {Icon && (
                <Icon size={18} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${error ? "text-red-500" : "text-slate-400 group-focus-within:text-yellow-500"}`} />
            )}
            {isSelect ? (
                <select value={value} onChange={onChange} disabled={disabled} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 appearance-none text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 ${Icon ? "pl-11" : "pl-4"} ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:border-slate-300"} ${error ? "border-red-500 bg-red-50" : ""}`}>
                    {options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
            ) : rows > 1 ? (
                <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 ${Icon ? "pl-11" : "pl-4"} ${error ? "border-red-500 bg-red-100/20" : "hover:border-slate-300"}`} />
            ) : (
                <input type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 ${Icon ? "pl-11" : "pl-4"} ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:border-slate-300"} ${error ? "border-red-500 bg-red-100/20" : ""}`} />
            )}
        </div>
        {error && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{error}</p>}
    </div>
);

export default function AddBusinessPage() {
    const initialState = {
        name: "", company: "", phone: "", email: "", altPhone: "", website: "",
        country: "India", state: "", city: "", pinCode: "", preferredAddress: "", businessDetails: "",
    };

    const [formData, setFormData] = useState(initialState);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});
    const [activeStep, setActiveStep] = useState(1);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (formData.state && indiaStatesCities[formData.state]) {
            setCities(indiaStatesCities[formData.state]);
        } else {
            setCities([]);
            setFormData(prev => ({ ...prev, city: "" }));
        }
    }, [formData.state]);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Full name is required.";
        if (!formData.company.trim()) newErrors.company = "Company name is required.";
        if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Valid 10-digit phone required.";
        if (!formData.state) newErrors.state = "Required";
        if (!formData.city) newErrors.city = "Required";
        if (!formData.preferredAddress) newErrors.preferredAddress = "Address required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSubmitting(true);
        let logoUrl = "";

        try {
            // 1. Handle File Upload to Supabase Storage
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('business-logos') // Ensure this bucket exists in Supabase
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('business-logos')
                    .getPublicUrl(fileName);
                
                logoUrl = publicUrl;
            }

            // 2. Submit Data to Table
            const { error: dbError } = await supabase.from("businesses").insert([{
                ...formData,
                logo_url: logoUrl,
                alt_phone: formData.altPhone,
                pin_code: formData.pinCode,
                preferred_address: formData.preferredAddress,
                business_details: formData.businessDetails,
            }]);

            if (dbError) throw dbError;

            alert("🎉 Business listed successfully!");
            
            // 3. RESET FORM AND GO BACK TO STEP 1
            setFormData(initialState);
            setFile(null);
            setActiveStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Grow with QickTick</span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight">List Your Business</h1>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-10 px-4">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${activeStep >= step ? "bg-slate-900 text-yellow-500 shadow-lg" : "bg-white text-slate-300 border border-slate-200"}`}>
                                {activeStep > step ? <CheckCircle2 size={20} /> : step}
                            </div>
                            {step < 3 && <div className={`h-1 flex-1 mx-4 rounded ${activeStep > step ? "bg-slate-900" : "bg-slate-200"}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* STEP 1 */}
                    <div className={`bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 ${activeStep === 1 ? 'block' : 'hidden'}`}>
                        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-sm">1</span> Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Full Name" value={formData.name} onChange={handleChange("name")} error={errors.name} Icon={User} />
                            <FormInput label="Business Name" value={formData.company} onChange={handleChange("company")} error={errors.company} Icon={Building} />
                            <FormInput label="Primary Phone" value={formData.phone} onChange={handleChange("phone")} error={errors.phone} Icon={Phone} type="tel" />
                            <FormInput label="Email" value={formData.email} onChange={handleChange("email")} Icon={Mail} required={false} />
                        </div>
                        <div className="mt-10 flex justify-end">
                            <button type="button" onClick={() => setActiveStep(2)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 group">
                                Next Step <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* STEP 2 */}
                    <div className={`bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 ${activeStep === 2 ? 'block' : 'hidden'}`}>
                        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-sm">2</span> Location Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="State" value={formData.state} onChange={handleChange("state")} error={errors.state} isSelect options={[{ value: "", label: "Select State" }, ...allStates.map(s => ({ value: s, label: s }))]} Icon={MapPin} />
                            <FormInput label="City" value={formData.city} onChange={handleChange("city")} error={errors.city} isSelect options={[{ value: "", label: "Select City" }, ...cities.map(c => ({ value: c, label: c }))]} disabled={!formData.state} Icon={MapPin} />
                        </div>
                        <div className="mt-10 flex justify-between">
                            <button type="button" onClick={() => setActiveStep(1)} className="text-slate-500 font-bold flex items-center gap-2"><ArrowLeft size={20} /> Back</button>
                            <button type="button" onClick={() => setActiveStep(3)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2">Next <ArrowRight /></button>
                        </div>
                    </div>

                    {/* STEP 3 */}
                    <div className={`bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 ${activeStep === 3 ? 'block' : 'hidden'}`}>
                        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-sm">3</span> Final Details
                        </h2>
                        <div className="space-y-6">
                            <FormInput label="Address" value={formData.preferredAddress} onChange={handleChange("preferredAddress")} error={errors.preferredAddress} rows={3} Icon={CornerDownRight} />
                            
                            {/* PHOTO UPLOAD LOGIC */}
                            <div className="flex flex-col">
                                <label className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-2">Upload Photo</label>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center hover:bg-yellow-50/30 hover:border-yellow-400 cursor-pointer transition-all"
                                >
                                    <Upload className="text-yellow-600 mb-2" />
                                    <p className="font-bold text-slate-700">{file ? file.name : "Select Business Photo"}</p>
                                    {file && <p className="text-xs text-green-600 font-bold">Ready to upload</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t flex justify-between items-center">
                            <button type="button" onClick={() => setActiveStep(2)} className="text-slate-500 font-bold flex items-center gap-2"><ArrowLeft /> Back</button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-yellow-400 text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-lg flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Listing"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}