import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  User2Icon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [loginState, setLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (loginState) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error("Please enter your name");
        }
        await register(name, email, password);
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(
        err?.message || "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="size-7" />
              <h1 className="text-2xl font-semibold text-slate-800">
                Postly AI
              </h1>
            </Link>
            <p className="text-slate-500 text-sm mt-1">
              {loginState
                ? "Sign in to your Dashboard"
                : "Create your free Postly account"}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2.5">
              <AlertCircleIcon className="size-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {!loginState && (
              <div>
                <label className="block mb-1.5 font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User2Icon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl focus:bg-white focus:border-red-400 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block mb-1.5 font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl focus:bg-white focus:border-red-400 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1.5 font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl focus:bg-white focus:border-red-400 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-red-500/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  {loginState ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {loginState ? "Sign In" : "Sign Up"}{" "}
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {loginState ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setLoginState(false);
                    setError(null);
                  }}
                  className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  Create one free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setLoginState(true);
                    setError(null);
                  }}
                  className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
