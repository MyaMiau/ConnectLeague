// pages/organization/create.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function CreateOrganization() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    instagram: "",
    twitter: "",
    website: "",
    logoUrl: ""
  });

  const router = useRouter();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const mockOrganization = {
      id: `org_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socialLinks: {
        instagram: formData.instagram,
        twitter: formData.twitter,
        website: formData.website
      },
      evaluations: []
    };

    console.log("Organização criada (mock):", mockOrganization);

    // Simulando redirecionamento após criar
    router.push("/organization/profile");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h2>Criar Organização</h2>
      <form onSubmit={handleSubmit}>
        <Input name="name" placeholder="Nome da Organização" onChange={handleChange} required />
        <Input name="description" placeholder="Descrição (opcional)" onChange={handleChange} />
        <Input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <Input name="logoUrl" placeholder="Logo URL (opcional)" onChange={handleChange} />
        <Input name="instagram" placeholder="Instagram (opcional)" onChange={handleChange} />
        <Input name="twitter" placeholder="Twitter (opcional)" onChange={handleChange} />
        <Input name="website" placeholder="Site Oficial (opcional)" onChange={handleChange} />
        <Button type="submit">Criar Organização</Button>
      </form>
    </div>
  );
}
