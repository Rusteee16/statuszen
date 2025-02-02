'use client';

import { NextResponse } from 'next/server';
import { publicComponents } from '~/server/db/schema';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Service {
  id: number;
  name: string;
  description: string;
  url: string;
  status: string;
  isPublic: boolean;
}

export default function PublicStatus() {
  const serviceSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    url: z.string(),
    status: z.string().optional(),
    isPublic: z.boolean().optional(),
  });

  const [components, setComponents] = useState<Service[]>([]);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/v3/publiccomponent');
      const componentIDs = await response.json();
      console.log(componentIDs);

      const componentDetails = await Promise.all(
        componentIDs.map(async (item: { id: string,componentId: string }) => {
          const res = await fetch(`/api/v3/components?id=${item.componentId}`);
          const data = await res.json();
          return data[0];
        })
      );

      const publicServices = componentDetails.map((service: Service) => ({
        ...service,
        description: service.description ?? 'No description available',
        status: service.status ?? 'UNKNOWN',
      }));
      console.log(publicServices);

      setComponents(publicServices);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComponents();
    console.log(components);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
          </tr>
        </thead>
        <tbody>
          {components.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{item.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline">
              {item.url ? (
                  <Link href={item.url}>View</Link>
                ) : (
                  <span className="text-gray-400">No Link Available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
