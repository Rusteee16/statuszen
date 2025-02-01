import React from "react";
import { HydrateClient, api } from "~/trpc/server";

interface Service {
  id: number;
  name: string;
  description: string;
  url: string;
  status: string;
  isPublic: boolean;
}

export default async function PublicServices() {
  const services = await api.organizationService.getAllServices();

  const publicServices = services.map((service: any) => ({
    ...service,
    description: service.description ?? "No description available",
    status: service.status ?? "Unknown",
    isPublic: service.isPublic ?? false,
  })).filter((service: Service) => service.isPublic);

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Public Services Status</h1>
        <ul className="space-y-4">
          {publicServices.map((service: Service) => (
            <li key={service.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <p className="text-gray-600">{service.description}</p>
              <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                {service.url}
              </a>
              <p className="mt-2 text-green-600 font-medium">Status: {service.status}</p>
            </li>
          ))}
        </ul>
      </div>
  );
}
