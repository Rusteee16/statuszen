"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const createOrganization = async (name: string) => {
  const res = await fetch("/api/v3/organization", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create organization");
  return res.json();
};

export default function CreateOrganizationPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const org = await createOrganization(name);
      // Force middleware to check user assignment by redirecting to root
      router.push("/");
    } catch (err) {
      setError("Failed to create organization. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Create an Organization</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md">
        <label className="block mb-2 text-lg">Organization Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 mb-4 text-black rounded"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">
          Create Organization
        </button>
      </form>
    </div>
  );
}
