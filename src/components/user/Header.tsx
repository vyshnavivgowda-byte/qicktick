"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";


// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserFeed() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) =>
    pathname === route ? "text-yellow-600 font-bold" : "text-black";

  // UI states
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // Login / Register states
  const [loginData, setLoginData] = useState({ email: "", otp: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", otp: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null); // timestamp when OTP expires
  const [otpTimer, setOtpTimer] = useState<string | null>(null); // "mm:ss" display
  const [userRole, setUserRole] = useState<"user" | "vendor" | null>(null);


  // Get current logged-in user on load
  useEffect(() => {
    const loadUserAndRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user?.email) {
        setUserRole(null);
        return;
      }

      // Check if logged-in user is a vendor
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", user.email)
        .single();

      if (vendor) {
        setUserRole("vendor");
      } else {
        setUserRole("user");
      }
    };

    loadUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndRole();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Login handler
  const sendLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      if (!loginData.email) {
        setLoginError("Email is required");
        return;
      }

      // Optional: allow only registered vendors/users
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", loginData.email)
        .single();

      // If you want to restrict login ONLY to vendors + existing users
      // then keep this check. Otherwise REMOVE it.
      if (!vendor) {
        setLoginError("Email not registered.");
        return;
      }

      // ✅ Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        email: loginData.email,
      });

      if (error) throw error;

      setLoginSuccess("OTP sent! It is valid for 5 minutes.");

      const expiryTime = Date.now() + 5 * 60 * 1000;
      setOtpExpiry(expiryTime);

      const timer = setInterval(() => {
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
          setOtpTimer("00:00");
          clearInterval(timer);
        } else {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          setOtpTimer(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        }
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };



  const verifyLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      if (otpExpiry && Date.now() > otpExpiry) {
        setLoginError("OTP expired.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: loginData.email,
        token: loginData.otp,
        type: "email",
      });

      if (error) throw error;

      // 🔍 Determine role AFTER login
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", loginData.email)
        .single();

      setShowLoginPopup(false);

      if (vendor) {
        router.push("/user/feed");
      } else {
        router.push("/user/feed");
      }
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };




  // Register
  const handleRegisterChange = (e: any) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  const sendRegisterOtp = async () => {
    if (!registerData.name || !registerData.email) {
      setRegisterError("Fill all fields");
      return;
    }
    setRegisterLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: registerData.email,
      options: { data: { name: registerData.name } },
    });
    if (error) setRegisterError(error.message);
    else {
      setRegisterStep("otp");
      setRegisterSuccess("OTP sent!");
    }
    setRegisterLoading(false);
  };
  const verifyRegisterOtp = async () => {
    setRegisterLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: registerData.email,
      token: registerData.otp,
      type: "email",
    });
    if (error) setRegisterError(error.message);
    else {
      setRegisterSuccess("Registration successful!");
      setTimeout(() => setShowRegisterPopup(false), 1500);
    }
    setRegisterLoading(false);
  };

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <header className="bg-white border-b sticky top-0 z-50 shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-28">
          <Link href="/user/feed">
            <Image src="/logo.jpg" alt="QickTick" width={150} height={60} />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 font-semibold text-black">
            <Link href="/user/feed" className={isActive("/user/feed")}>Home</Link>
            <Link href="/user/subscription-plans" className={isActive("/user/subscription-plans")}>Plans</Link>
            <Link href="/user/listing" className={isActive("/user/listing")}>Listing</Link>
            <Link href="/user/video" className={isActive("/user/video")}>Video</Link>
            <Link href="/user/transport" className={isActive("/user/transport")}>Transport</Link>
            <Link href="/user/enquiry" className={isActive("/user/enquiry")}>Enquiry</Link>
            <Link href="/user/help" className={isActive("/user/help")}>Help And Earn</Link>
            {/* <Link href="/user/vendor-profile" className={isActive("/user/vendor-profile")}>Vendor</Link> */}
            <Link href="/user/add-business" className="px-4 py-2 bg-black text-white rounded-md">Add Business</Link>

            {/* ▼ BEFORE login - show LOGIN + REGISTER */}
            {!user && (
              <div className="flex space-x-3">
                <button onClick={() => setShowLoginPopup(true)} className="border px-3 py-2 rounded">
                  Login
                </button>
                {/* Register Button in Header */}
                {/* Register Dropdown in Header */}
                <div className="relative">
                  {/* ---------------- REDESIGNED PREMIUM HEADER ---------------- */}
                  <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
                    {/* Glassmorphism Background Container */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)]" />

                    <div className="relative max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between gap-4">

                      {/* Brand Logo */}
                      <Link href="/user/feed" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                        <Image
                          src="/logo.jpg"
                          alt="QickTick"
                          width={130}
                          height={50}
                          className="object-contain"
                        />
                      </Link>

                      {/* Main Navigation Links */}
                      <nav className="hidden xl:flex items-center bg-slate-100/50 rounded-2xl p-1.5 border border-slate-200/50">
                        {[
                          { name: "Home", href: "/user/feed" },
                          { name: "Plans", href: "/user/subscription-plans" },
                          { name: "Listing", href: "/user/listing" },
                          { name: "Video", href: "/user/video" },
                          { name: "Transport", href: "/user/transport" },
                          { name: "Enquiry", href: "/user/enquiry" },
                          { name: "Help & Earn", href: "/user/help" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${pathname === item.href
                              ? "bg-[#FFD700] text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white"
                              }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>

                      {/* Right Side Actions */}
                      <div className="flex items-center space-x-4">
                        <Link
                          href="/user/add-business"
                          className="hidden md:flex px-5 py-2.5 bg-slate-900 text-[#FFD700] rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-lg shadow-slate-200"
                        >
                          Add Business
                        </Link>

                        {/* Auth Section */}
                        {!user ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowLoginPopup(true)}
                              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              Login
                            </button>

                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === "register" ? null : "register")}
                                className="bg-[#FFD700] px-5 py-2.5 rounded-xl text-sm font-black text-slate-900 shadow-md hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                              >
                                Register
                              </button>

                              {openMenu === "register" && (
                                <div className="absolute right-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <button
                                    onClick={() => { setShowRegisterPopup(true); setOpenMenu(null); }}
                                    className="flex w-full text-left px-5 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                                  >
                                    User Registration
                                  </button>
                                  <div className="h-[1px] bg-slate-100 mx-3" />
                                  <Link
                                    href="/vendorlogin"
                                    className="flex px-5 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    Vendor Registration
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
                              className="flex items-center gap-2 p-0.5 rounded-full border-2 border-[#FFD700] hover:bg-yellow-50 transition-all shadow-sm"
                            >
                              <UserCircle size={38} className="text-slate-900" />
                            </button>

                            {openMenu === "profile" && (
                              <div className="absolute right-0 mt-3 bg-white shadow-2xl rounded-[2rem] border border-slate-100 py-4 w-64 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-6 py-3 mb-2 border-b border-slate-50">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                  <p className="text-sm font-black truncate text-slate-900">{user.email}</p>
                                </div>

                                <div className="space-y-1">
                                  <Link
                                    href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
                                    className="flex px-6 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                                  >
                                    My Profile
                                  </Link>

                                  {userRole === "vendor" && (
                                    <>
                                      <Link href="/vendor/products" className="flex px-6 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors">Manage Products</Link>
                                      <Link href="/vendor/enquiry" className="flex px-6 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors">View Enquiries</Link>
                                      <Link href="/vendor/subscription" className="flex px-6 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors text-yellow-600">Active Plans</Link>
                                    </>
                                  )}
                                </div>

                                <button
                                  onClick={logout}
                                  className="flex w-full px-6 py-4 hover:bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest items-center gap-3 mt-2 border-t border-slate-50 transition-colors"
                                >
                                  <LogOut size={16} /> Logout Account
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* IMPORTANT: Spacer so content doesn't hide under the fixed header */}
                  <div className="h-20 md:h-24" />
                </div>


              </div>
            )}

            {/* ▼ AFTER login - show PROFILE ICON */}
            {user && (
              <div className="relative">
                <button onClick={() => setOpenMenu(openMenu ? null : "profile")}>
                  <UserCircle size={36} className="text-black" />
                </button>

                {openMenu === "profile" && (
                  <div className="absolute right-0 bg-white shadow-xl rounded-md py-2 w-52 text-sm z-50">
                    {/* My Profile link */}
                    <Link
                      href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
                      className="flex px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>

                    {/* ▼ Vendor-specific links (only visible for vendors) */}
                    {userRole === "vendor" && (
                      <>
                        <Link
                          href="/vendor/products"
                          className="flex px-4 py-2 hover:bg-gray-100"
                        >
                          Products
                        </Link>
                        <Link
                          href="/vendor/enquiry"
                          className="flex px-4 py-2 hover:bg-gray-100"
                        >
                          Enquiries
                        </Link>
                        <Link
                          href="/vendor/subscription"
                          className="flex px-4 py-2 hover:bg-gray-100"
                        >
                          Subscription
                        </Link>
                      </>
                    )}

                    {/* Logout button */}
                    <button
                      onClick={logout}
                      className="flex w-full px-4 py-2 hover:bg-gray-100 text-left"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

          </nav>
        </div>
      </header>

      {/* -------------------- LOGIN POPUP ------------------------ */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLoginPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />

            <div className="p-10">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-500 font-medium">Enter your email to access your account</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {loginSuccess}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="name@company.com"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">One-Time Password</label>
                    {otpTimer && <span className="text-xs font-bold text-yellow-600 mb-1">{otpTimer} remaining</span>}
                  </div>
                  <input
                    name="otp"
                    value={loginData.otp}
                    onChange={handleLoginChange}
                    placeholder="8-digit code"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold tracking-[0.2em] text-center text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={sendLoginOtp}
                    disabled={loginLoading}
                    className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {loginLoading ? "Sending..." : "Send OTP"}
                  </button>
                  <button
                    onClick={verifyLoginOtp}
                    disabled={loginLoading}
                    className="py-4 bg-[#FFD700] hover:bg-yellow-400 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loginLoading ? "Verifying..." : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* -------------------- REGISTER POPUP ------------------------ */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowRegisterPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-[#FFD700] to-yellow-300" />

            <div className="p-10">
              <button
                onClick={() => setShowRegisterPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 font-medium">Join QickTick today and get started</p>
              </div>

              {registerError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {registerSuccess}
                </div>
              )}

              <div className="space-y-5">
                {registerStep === 'form' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="john@example.com"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-slate-900"
                      />
                    </div>

                    <button
                      onClick={sendRegisterOtp}
                      disabled={registerLoading}
                      className="w-full py-4 bg-slate-900 text-[#FFD700] rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-slate-200 transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50"
                    >
                      {registerLoading ? "Sending OTP..." : "Get Verification Code"}
                    </button>
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 mb-6">
                        <p className="text-xs text-yellow-800 font-bold text-center">
                          We've sent a code to <span className="underline">{registerData.email}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Verification Code</label>
                        <input
                          name="otp"
                          value={registerData.otp}
                          onChange={handleRegisterChange}
                          placeholder="Enter Code"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-center text-2xl tracking-[0.5em]"
                        />
                      </div>

                      <button
                        onClick={verifyRegisterOtp}
                        disabled={registerLoading}
                        className="w-full py-4 bg-[#FFD700] text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50"
                      >
                        {registerLoading ? "Verifying..." : "Complete Registration"}
                      </button>

                      <button
                        onClick={() => setRegisterStep('form')}
                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tighter"
                      >
                        ← Back to details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
