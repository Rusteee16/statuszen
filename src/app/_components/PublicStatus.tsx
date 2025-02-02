'use client';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'
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

function getStatusIcon(status: Service['status']) {
  switch (status) {
    case 'OPERATIONAL':
      return <CheckCircle className="text-green-500 w-5 h-5 inline-block mr-1" />
    case 'PERFORMANCE_ISSUES':
      return <AlertTriangle className="text-yellow-500 w-5 h-5 inline-block mr-1" />
    case 'PARTIAL_OUTAGE':
      return <AlertTriangle className="text-orange-500 w-5 h-5 inline-block mr-1" />
    case 'MAJOR_OUTAGE':
      return <XCircle className="text-red-500 w-5 h-5 inline-block mr-1" />
    default:
      return <HelpCircle className="text-gray-500 w-5 h-5 inline-block mr-1" />
  }
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

      setComponents(publicServices);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-2">Welcome to StatusZen</h2>
        <p className="text-gray-300">
          Real-time status updates for all your services. Explore the public
          services below!
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Public Status</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Details</th>
                <th className="px-4 py-2 text-left font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {components.map((service) => (
                <tr key={service.id} className="border-b border-gray-800">
                  <td className="px-4 py-2">{service.name}</td>
                  <td className="px-4 py-2">
                    {getStatusIcon(service.status)}
                    {service.status}
                  </td>
                  <td className="px-4 py-2">
                    {service.description || 'No description available'}
                  </td>
                  <td className="px-4 py-2 underline text-blue-400">
                    {service.url ? (
                      <Link href={service.url} target="_blank">
                        Visit
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
