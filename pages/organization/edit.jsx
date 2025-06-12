// pages/organization/edit.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function EditOrganization() {
  const router = useRouter();

  // Estado simulado (normalmente isso viria do back-end)
  const [organization, setOrganization] = useState({
    name: "Nome da Organização",
    description: "Breve descrição da organização",
    logoUrl: "https://link-da-logo-ou-avatar.png",
    socialLinks: {
      instagram: "https://instagram.com/org",
      twitter: "https://twitter.com/org",
      website: "https://siteoficial.com"
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in organization.socialLinks) {
      setOrganization((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value
        }
      }));
    } else {
      setOrganization((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui futuramente vamos fazer o POST/PUT com o back-end
    console.log("Organização atualizada:", organization);

    // Redirecionar para a página de perfil
    router.push("/organization/profile");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Editar Organização</h1>
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <Input name="name" value={organization.name} onChange={handleChange} />

        <label>Descrição:</label>
        <Input name="description" value={organization.description} onChange={handleChange} />

        <label>Logo (URL):</label>
        <Input name="logoUrl" value={organization.logoUrl} onChange={handleChange} />

        <label>Instagram:</label>
        <Input name="instagram" value={organization.socialLinks.instagram} onChange={handleChange} />

        <label>Twitter:</label>
        <Input name="twitter" value={organization.socialLinks.twitter} onChange={handleChange} />

        <label>Site Oficial:</label>
        <Input name="website" value={organization.socialLinks.website} onChange={handleChange} />

        <Button type="submit" style={{ marginTop: "1rem" }}>Salvar Alterações</Button>
      </form>
    </div>
  );
}
