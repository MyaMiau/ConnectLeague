// pages/organization/profile.jsx
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import Image from "next/image";

export default function OrganizationProfile() {
  const [profileImage, setProfileImage] = useState("/default-avatar.png");

  const organizationData = {
    name: "Equipe Alpha",
    description: "Time competitivo focado em torneios amadores de League of Legends.",
    socialLinks: {
      instagram: "https://instagram.com/equipealpha",
      twitter: "https://twitter.com/equipealpha",
      website: "https://equipealpha.com",
    },
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Perfil da Organização</h1>

      <Card className="w-full max-w-4xl bg-zinc-900">
        <CardContent className="flex flex-col md:flex-row gap-8 p-6 items-center">
          <div className="flex flex-col items-center">
            <Image
              src={profileImage}
              width={120}
              height={120}
              className="rounded-full border-4 border-zinc-700"
              alt="Logo da organização"
            />
            <label className="mt-2 cursor-pointer text-sm text-zinc-400 hover:text-white">
              Trocar logo
              <Input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="flex-1">
            <p className="text-lg font-semibold">{organizationData.name}</p>
            <p className="text-sm text-zinc-400 mt-1">{organizationData.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {organizationData.socialLinks.instagram && (
                <a href={organizationData.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Button>Instagram</Button>
                </a>
              )}
              {organizationData.socialLinks.twitter && (
                <a href={organizationData.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button>Twitter</Button>
                </a>
              )}
              {organizationData.socialLinks.website && (
                <a href={organizationData.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <Button>Site</Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}