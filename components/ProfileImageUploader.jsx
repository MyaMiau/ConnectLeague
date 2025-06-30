import { useRef } from "react";

export default function ProfileImageUploader({ onUploaded }) {
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Lê o arquivo como base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      // Use o nome original ou gere um nome único
      const filename = `${Date.now()}-${file.name}`;

      // Envia para a API
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, filename }),
      });

      if (res.ok) {
        const { url } = await res.json();
        onUploaded(url); // Passe a URL para o componente pai
      } else {
        alert("Falha ao fazer upload da imagem!");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}