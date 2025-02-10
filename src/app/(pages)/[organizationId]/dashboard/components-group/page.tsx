"use client";

import { useEffect, useState } from "react";

 type Group = {
  id: string;
  name: string;
};

type ComponentsGroupPageProps = {
  params: {
    orgid: string;
  };
};

const fetchGroups = async (orgId: string): Promise<Group[]> => {
  const res = await fetch(`/api/v3/groups?orgId=${orgId}`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
};

const deleteGroup = async (groupId: string): Promise<void> => {
  await fetch("/api/v3/groups", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });
};

const addGroup = async (orgId: string, name: string): Promise<void> => {
  await fetch("/api/v3/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, name }),
  });
};

export default function ComponentsGroupPage({ params }: ComponentsGroupPageProps) {
  const { orgid } = params;
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    fetchGroups(orgid)
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [orgid]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Component Groups</h1>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Failed to load groups</p>
      ) : (
        <div className="space-y-6">
          <table className="w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-4 py-2">Group Name</th>
                <th className="border border-gray-600 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="text-center">
                  <td className="border border-gray-600 px-4 py-2">{group.name}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <button
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded"
                      onClick={() => deleteGroup(group.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <input
              type="text"
              className="p-2 text-black rounded"
              placeholder="New Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button
              className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded"
              onClick={() => addGroup(orgid, newGroupName)}
            >
              Add Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
