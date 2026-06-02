"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Coffee, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.session) {
        // Logged in successfully
        localStorage.setItem("s7_session", "active");
        localStorage.setItem("s7_user_email", email);
        router.push("/dashboard");
        return;
      }

      // 2. Fallback for demo/presentation convenience
      if (
        (email === "admin@sectorseven.com" && password === "admin123") ||
        (email === "admin" && password === "admin")
      ) {
        localStorage.setItem("s7_session", "active");
        localStorage.setItem("s7_user_email", "admin@sectorseven.com");
        router.push("/dashboard");
        return;
      }

      // If both fail
      setErrorMsg(error?.message || "Email atau password salah. Coba: admin@sectorseven.com / admin123");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md p-6 z-10">
        <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-amber-600 p-3 rounded-2xl text-zinc-950 shadow-lg shadow-amber-600/10">
              <Coffee className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tight text-zinc-100">Sector Seven</h1>
              <p className="text-xs text-amber-500 font-bold tracking-widest uppercase mt-0.5">Integrated Operating System</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-500 text-center font-medium">
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="admin@sectorseven.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500 placeholder-zinc-650 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500 placeholder-zinc-650 transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-zinc-950 font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 mt-6 shadow-lg shadow-amber-600/5 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Mengautentikasi...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Hint */}
          <div className="text-center">
            <p className="text-[10px] text-zinc-500">
              Demo access: <code className="text-zinc-400 bg-zinc-950 px-1 py-0.5 rounded">admin@sectorseven.com</code> / <code className="text-zinc-400 bg-zinc-950 px-1 py-0.5 rounded">admin123</code>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
