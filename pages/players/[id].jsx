// pages/players/[id].jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Mock de jogadores (pode ser movido para um arquivo separado depois)
const mockPlayers = [
  {
    id: "1",
    name: "Jogador Alpha",
    role: "Top",
    rank: "Diamante IV",
    bio: "Jogo desde 2017. Focado em competitivo.",
    avatarUrl: "/default-avatar.png"
  },
  {
    id: "2",
    name: "Jogadora Beta",
    role: "ADC",
    rank: "Platina II",
    bio: "Participante de torneios universitários.",
    avatarUrl: "/default-avatar.png"
  }
];

export default function PlayerProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (id) {
      const found = mockPlayers.find((p) => p.id === id);
      setPlayer(found);
    }
  }, [id]);

  if (!player) {
    return <p>Carregando jogador...</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <img src={player.avatarUrl} alt="Avatar" style={{ width: 120, height: 120, borderRadius: "50%" }} />
      <h2>{player.name}</h2>
      <p><strong>Função:</strong> {player.role}</p>
      <p><strong>Elo:</strong> {player.rank}</p>
      <p><strong>Sobre:</strong> {player.bio}</p>
    </div>
  );
}
