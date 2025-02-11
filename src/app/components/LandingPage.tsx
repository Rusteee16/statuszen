"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const fetchPublicComponents = async () => {
  const res = await fetch("/api/v3/publiccomponent");
  if (!res.ok) throw new Error("Failed to fetch components");
  return res.json();
};

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPublicComponents()
      .then(setComponents)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white">
      {/* Navbar */}
      <div className="w-full p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold">StatusZen</h1>
        {isLoaded && user && (
          <Link href="/create-organization" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">
            Dashboard
          </Link>
        )}
      </div>

      {/* Components Table */}
      <div className="container mx-auto p-6 bg-gray-800 shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold mb-4">Public Components</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load components</p>
        ) : (
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="border border-gray-600 px-4 py-2">Component</th>
                <th className="border border-gray-600 px-4 py-2">Status</th>
                <th className="border border-gray-600 px-4 py-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {components?.map((component: any) => (
                <tr key={component.id} className="text-center">
                  <td className="border border-gray-600 px-4 py-2">{component.name}</td>
                  <td
                    className={`border border-gray-600 px-4 py-2 font-bold ${
                      component.status === "OPERATIONAL" ? "text-green-400" :
                      component.status === "PERFORMANCE_ISSUES" ? "text-yellow-400" :
                      component.status === "PARTIAL_OUTAGE" ? "text-orange-400" :
                      "text-red-400"
                    }`}
                  >

  {component.status ? component.status.replace("_", " ") : "UNKNOWN"}

                  </td>
                  <td className="border border-gray-600 px-4 py-2">{new Date(component.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-gray-800 text-white text-center mt-10">
        © 2025 StatusZen | All Rights Reserved
      </footer>
    </div>
  );
}
