"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "~/trpc/server";

interface Service {
  id: number;
  name: string;
  description: string;
  url: string;
  status: string;
  isPublic: boolean;
  organizationId: number;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
}

export default function OrganizationServices() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [orgServices, setOrgServices] = useState<Service[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationAndServices = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setError("You must be logged in to view organization services.");
        setIsLoading(false);
        return;
      }

      try {
        const user = await api.userTeam.getCurrentUser();

        if (!user || !user.id) {
          throw new Error("Invalid user.");
        }

        const orgArray = await api.organizationDetails.getOrganizationForUser({ userId: Number(user.id) });

        if (!orgArray || orgArray.length === 0 || !orgArray[0]) {
          setError("No organization found for this user.");
          setIsLoading(false);
          return;
        }

        const org: Organization = orgArray[0]; // Ensure org is not undefined
        setOrganization(org);

        const services = await api.organizationDetails.getOrganizationServices({ organizationId: org.id });

        const sanitizedServices: Service[] = services.map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description ?? "No description available",
          url: service.url,
          status: service.status ?? "Unknown",
          isPublic: service.isPublic ?? false,
          organizationId: service.organizationId ?? 0,
        }));

        setOrgServices(sanitizedServices);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationAndServices();
  }, [isLoaded, isSignedIn, userId]);

  if (isLoading) return <p>Loading organization services...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Organization Services</h1>
      {organization && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Organization:</h2>
          <p className="font-medium text-blue-600">{organization.name}</p>
        </div>
      )}
      <ul className="space-y-4">
        {orgServices.map((service) => (
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
