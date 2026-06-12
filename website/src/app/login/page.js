"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Chrome, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 relative overflow-hidden group">
          {/* Animated background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-500" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[60px] group-hover:bg-purple-500/20 transition-all duration-500" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 neon-text-blue">Welcome Back</h2>
            <p className="text-gray-400 mb-8">Enter your credentials to access your notes</p>

            {error && (
              <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Link href="/forgot-password" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <LogIn className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="mt-8 text-center text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
