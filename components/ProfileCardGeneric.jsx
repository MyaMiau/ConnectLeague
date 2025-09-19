import Image from "next/image";
import { Button } from "./ui/button";

export default function ProfileCardGeneric({ user, showEdit = false, onEdit }) {
  if (!user) return <div>Carregando perfil...</div>;

  // Define nome e bio/descrição para exibir conforme o tipo
  const displayName = user.orgName || user.name;
  const displayBio = user.orgDesc || user.bio;
  const displayImage = user.logo || user.image || "/default-avatar.png";
  const typeMap = {
    organization: "Organização",
    coach: "Coach",
    headcoach: "Head Coach",
    manager: "Manager",
    psychologist: "Psicólogo"
  };
  const profileTitle = typeMap[user.type] || "Perfil";

  return (
    <div className="w-full max-w-2xl bg-zinc-900 mb-8 rounded-xl shadow-lg">
      <div className="flex flex-col items-center py-8">
        <Image
          src={displayImage}
          width={120}
          height={120}
          className="rounded-full border-4 border-zinc-700 object-cover"
          alt={`Avatar de ${displayName}`}
        />
        <h1 className="text-3xl font-bold mt-4 mb-2">{profileTitle}</h1>
        <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
        <p className="text-zinc-400 mb-2">{user.email}</p>
        {displayBio ? (
          <p className="text-zinc-300 mb-2">{displayBio}</p>
        ) : (
          <p className="italic text-zinc-600 mb-2">Nenhuma descrição ainda.</p>
        )}
        {showEdit && (
          <Button onClick={onEdit || (() => {})} className="mt-4">
            Editar Perfil
          </Button>
        )}
      </div>
    </div>
  );
}