// pages/profile/edit.jsx
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "Mya",
    role: "Suporte",
    elo: "Diamante",
    description: "Narradora, jogadora e apaixonada por LoL!"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados salvos:", formData);
    alert("Perfil salvo com sucesso (simulado)!");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Editar Perfil</h1>
      <form onSubmit={handleSubmit}>
        <label>Nome</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <label>Função</label>
        <Input
          name="role"
          value={formData.role}
          onChange={handleChange}
        />
        <label>Elo</label>
        <Input
          name="elo"
          value={formData.elo}
          onChange={handleChange}
        />
        <label>Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginBottom: "1rem"
          }}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  );
}
