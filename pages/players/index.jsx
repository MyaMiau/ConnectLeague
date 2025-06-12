// pages/players/index.jsx
import Link from "next/link";
import Image from "next/image";

export default function PlayerList() {
  // Lista mockada de jogadores
  const players = [
    {
      id: "player1",
      name: "JogadorEx1",
      role: "ADC",
      rank: "Platina II",
      riotId: "Ex1#BR1",
      summonerIcon: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/588.png",
    },
    {
      id: "player2",
      name: "JogadorEx2",
      role: "Jungler",
      rank: "Diamante IV",
      riotId: "Ex2#BR1",
      summonerIcon: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/5299.png",
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1>Jogadores</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {players.map((player) => (
          <li key={player.id} style={{ marginBottom: 20 }}>
            <Link href={`/players/${player.id}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                <Image
                  src={player.summonerIcon}
                  alt="Ícone"
                  width={48}
                  height={48}
                  style={{ borderRadius: "50%" }}
                />
                <div>
                  <strong>{player.name}</strong>
                  <p style={{ margin: 0 }}>{player.role} - {player.rank}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
