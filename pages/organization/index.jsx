import { useEffect } from "react";
import { useRouter } from "next/router";
import { isAuthenticated } from "@/utils/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const mockOrganization = {
  id: "org1",
  name: "Equipe Alpha",
  description: "Time competitivo focado em torneios amadores.",
  logoUrl: "/default-avatar.png",
  socialLinks: {
    instagram: "https://instagram.com/equipealpha",
    website: "https://equipealpha.com",
  },
};

export default function OrganizationProfile() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Image
          src={mockOrganization.logoUrl}
          alt="Logo da organização"
          width={80}
          height={80}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-2xl font-bold">{mockOrganization.name}</h1>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Sobre</h2>
        <p className="text-gray-700 mt-2">{mockOrganization.description}</p>
      </div>
      <div className="mt-4 flex gap-2">
        {mockOrganization.socialLinks.instagram && (
          <a
            href={mockOrganization.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Instagram
          </a>
        )}
        {mockOrganization.socialLinks.website && (
          <a
            href={mockOrganization.socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Site oficial
          </a>
        )}
      </div>
    </div>
  );
}
