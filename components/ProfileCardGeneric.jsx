import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function ProfileCardGeneric({ user, showEdit = false, onUserUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [localUser, setLocalUser] = useState(() => ({
    ...(user || {}),
    orgName: user?.orgName || "",
    orgDesc: user?.orgDesc || "",
    logo: user?.logo || user?.image || "/default-avatar.png",
    email: user?.email || "",
  }));

  useEffect(() => {
    setLocalUser(prev => ({
      ...(user || {}),
      orgName: user?.orgName || "",
      orgDesc: user?.orgDesc || "",
      logo: user?.logo || user?.image || "/default-avatar.png",
      email: user?.email || "",
    }));
  }, [user]);

  // Lógica de upload de imagem (igual ao ProfileCard)
  async function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const filename = `${Date.now()}-${file.name}`;
        // Supondo API igual ao ProfileCard
        const res = await fetch("/api/upload-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename }),
        });
        if (res.ok) {
          const { url } = await res.json();
          setLocalUser((prev) => ({ ...prev, logo: url }));
        } else {
          alert("Erro ao fazer upload da imagem.");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setLocalUser((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    // Chama função de atualizar perfil no parent (igual ao ProfileCard)
    if (onUserUpdate) {
      await onUserUpdate(localUser);
    }
    setEditMode(false);
  }

  function handleCancel() {
    setLocalUser({
      ...(user || {}),
      orgName: user?.orgName || "",
      orgDesc: user?.orgDesc || "",
      logo: user?.logo || user?.image || "/default-avatar.png",
      email: user?.email || "",
    });
    setEditMode(false);
  }

  if (!user) return <div>Carregando perfil...</div>;

  // Visualização (não editando)
  if (!editMode) {
    const displayName = user.orgName || user.name;
    const displayBio = user.orgDesc || user.bio || "Nenhuma descrição ainda.";
    const displayImage = user.logo || user.image || "/default-avatar.png";
    const displayEmail = user.email || user.orgEmail || "";
    const typeMap = {
      organization: "Organização",
      coach: "Coach",
      headcoach: "Head Coach",
      manager: "Manager",
      psychologist: "Psicólogo"
    };
    const profileTitle = typeMap[user.type] || "Perfil";

    return (
      <div className="w-full max-w-2xl bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 mb-8">
        <div className="flex flex-col items-center py-8 px-6">
          <Image
            src={displayImage}
            width={120}
            height={120}
            className="rounded-full border-4 border-zinc-700 object-cover"
            alt={`Avatar de ${displayName}`}
          />
          <h1 className="text-3xl font-bold mt-4 mb-2">{profileTitle}</h1>
          <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
          {displayEmail && <p className="text-zinc-400 mb-2">{displayEmail}</p>}
          <p className="text-zinc-300 mb-2">{displayBio}</p>
          {showEdit && (
            <Button onClick={() => setEditMode(true)} className="mt-4">
              Editar Perfil
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Modo edição
  return (
    <div className="w-full max-w-2xl bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 mb-8">
      <div className="flex flex-col items-center py-8 px-6">
        <label className="cursor-pointer relative group">
          <Image
            src={localUser.logo}
            width={120}
            height={120}
            className="rounded-full border-4 border-purple-500 object-cover"
            alt="Avatar"
          />
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleImage}
          />
          <span className="absolute bottom-0 left-0 bg-black/60 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Trocar imagem
          </span>
        </label>
        <Input
          name="orgName"
          value={localUser.orgName}
          onChange={handleChange}
          placeholder="Nome da organização"
          className="mt-4 mb-2 text-center text-lg font-bold"
        />
        <Input
          name="email"
          value={localUser.email}
          onChange={handleChange}
          placeholder="Email"
          className="mb-2 text-center"
        />
        <Textarea
          name="orgDesc"
          value={localUser.orgDesc}
          onChange={handleChange}
          placeholder="Descrição da organização"
          className="mb-2"
        />
        <div className="flex gap-2 mt-4">
          <Button variant="default" onClick={handleSave}>Salvar</Button>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}