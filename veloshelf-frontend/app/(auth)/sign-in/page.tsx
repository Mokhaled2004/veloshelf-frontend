"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      
      // Store the secure cryptographically signed JWT token
      localStorage.setItem("access_token", data.access_token);

      // Redirect to main dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFEFE] px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#002244]">
            Velo<span className="text-[#0085C3]">Shelf</span>
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Retail Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#002244]">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. gm.demo"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0085C3] focus:outline-none focus:ring-1 focus:ring-[#0085C3] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002244]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#0085C3] focus:outline-none focus:ring-1 focus:ring-[#0085C3] sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#002244] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0085C3] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}