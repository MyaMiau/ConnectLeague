import Image from "next/image";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

// Dados mockados
const organization = {
  name: "BlackFox Esports",
  description: "Organização focada em revelar talentos do cenário amador.",
  email: "contato@blackfox.gg",
  logoUrl: "/default-avatar.png", // Altere se tiver logo real
  socialLinks: {
    instagram: "https://instagram.com/blackfox",
    twitter: "https://twitter.com/blackfox",
    website: "https://blackfox.gg"
  },
  evaluations: [
    {
      playerId: "player123",
      comment: "Jogador dedicado, treina com frequência e respeita horários.",
      rating: 4.8
    }
  ]
};

export default function OrganizationProfile() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <Card>
        <CardContent style={{ textAlign: "center" }}>
          <Image
            src={organization.logoUrl}
            alt="Logo da Organização"
            width={100}
            height={100}
            style={{ borderRadius: "50%" }}
          />
          <h2>{organization.name}</h2>
          <p>{organization.description}</p>
          <p><strong>Email:</strong> {organization.email}</p>

          <div style={{ marginTop: "1rem" }}>
            {organization.socialLinks.instagram && (
              <a href={organization.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <Button>Instagram</Button>
              </a>
            )}
            {organization.socialLinks.twitter && (
              <a href={organization.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Button>Twitter</Button>
              </a>
            )}
            {organization.socialLinks.website && (
              <a href={organization.socialLinks.website} target="_blank" rel="noopener noreferrer">
                <Button>Site Oficial</Button>
              </a>
            )}
          </div>

          <div style={{ marginTop: "2rem", textAlign: "left" }}>
            <h3>Avaliações</h3>
            {organization.evaluations.length > 0 ? (
              organization.evaluations.map((evalItem, index) => (
                <div key={index} style={{ marginBottom: "1rem" }}>
                  <p><strong>Comentário:</strong> {evalItem.comment}</p>
                  <p><strong>Nota:</strong> {evalItem.rating}</p>
                </div>
              ))
            ) : (
              <p>Nenhuma avaliação ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
