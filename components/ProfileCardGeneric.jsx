import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function ProfileCardGeneric({ user, showEdit = false, onUserUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setLocalUser((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    const response = await fetch(`/api/users/${localUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localUser),
    });
    if (response.ok) {
      const updated = await response.json();
      setEditMode(false);
      if (onUserUpdate) onUserUpdate(updated);
      setLocalUser(updated);
      alert("Perfil salvo com sucesso!");
    } else {
      alert("Erro ao salvar perfil.");
    }
  }

  if (!localUser) return <div>Carregando perfil...</div>;

  const displayName = localUser.orgName || localUser.name;
  const displayBio = localUser.orgDesc || localUser.bio;
  const displayImage = localUser.logo || localUser.image || "/default-avatar.png";
  const typeMap = {
    organization: "Organização",
    coach: "Coach",
    headcoach: "Head Coach",
    manager: "Manager",
    psychologist: "Psicólogo"
  };
  const profileTitle = typeMap[localUser.type] || "Perfil";

  return (
    <div className="w-full max-w-2xl bg-zinc-900 mb-8 rounded-xl shadow-lg relative">
      {showEdit && (
        <div className="absolute top-4 right-4">
          {!editMode ? (
            <Button size="sm" onClick={() => setEditMode(true)}>Editar Perfil</Button>
          ) : (
            <Button size="sm" onClick={handleSave}>Salvar</Button>
          )}
        </div>
      )}
      <div className="flex flex-col items-center py-8">
        <Image
          src={displayImage}
          width={120}
          height={120}
          className="rounded-full border-4 border-zinc-700 object-cover"
          alt={`Avatar de ${displayName}`}
        />
        <h1 className="text-3xl font-bold mt-4 mb-2">{profileTitle}</h1>
        {editMode ? (
          <>
            <Input
              name="name"
              value={localUser.name}
              onChange={handleChange}
              className="text-2xl font-semibold mb-2"
              placeholder="Nome"
            />
            <Input
              name="email"
              value={localUser.email}
              onChange={handleChange}
              className="mb-2"
              placeholder="Email"
            />
            <Textarea
              name="bio"
              value={localUser.bio}
              onChange={handleChange}
              className="mb-2"
              placeholder="Descrição/Bio"
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
            <p className="text-zinc-400 mb-2">{localUser.email}</p>
            {displayBio ? (
              <p className="text-zinc-300 mb-2">{displayBio}</p>
            ) : (
              <p className="italic text-zinc-600 mb-2">Nenhuma descrição ainda.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}