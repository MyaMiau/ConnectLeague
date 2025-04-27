import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import Image from "next/image";

export default function PlayerProfile() {
  const [isRiotLinked, setIsRiotLinked] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-avatar.png"); // imagem padrão

  // Mock dos dados da Riot
  const riotData = {
    summonerName: "Rengar324",
    tier: "Mestre",
    profileIconUrl: "/riot-icon.png",
    stats: {
      teamfights: 66.7,
      duels: 66.1,
      soloDeaths: 33.3,
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
      <h1 className="text-3xl font-bold mb-6">Perfil do Jogador</h1>

      <Card className="w-full max-w-4xl bg-zinc-900">
        <CardContent className="flex flex-col md:flex-row gap-8 p-6 items-center">
          <div className="flex flex-col items-center">
            <Image
              src={isRiotLinked ? riotData.profileIconUrl : profileImage}
              width={120}
              height={120}
              className="rounded-full border-4 border-zinc-700"
              alt="Imagem de perfil"
            />
            <label className="mt-2 cursor-pointer text-sm text-zinc-400 hover:text-white">
              Trocar imagem
              <Input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="flex-1">
            <p className="text-lg font-semibold">{riotData.summonerName}</p>
            <p className="text-sm text-zinc-400">{isRiotLinked ? `Tier: ${riotData.tier}` : "Conta Riot não vinculada"}</p>

            {!isRiotLinked && (
              <Button className="mt-4" onClick={() => setIsRiotLinked(true)}>
                Vincular conta Riot
              </Button>
            )}

            {isRiotLinked && (
              <div className="mt-6 space-y-2">
                <p>Vitórias em Teamfights: {riotData.stats.teamfights}%</p>
                <p>Vitórias em Duelos: {riotData.stats.duels}%</p>
                <p>Mortes Individuais: {riotData.stats.soloDeaths}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
