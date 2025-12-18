import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function ProfileCardGeneric({ user, showEdit = false, onUserUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [localUser, setLocalUser] = useState(() => ({
    ...(user || {}),
    orgName: user?.orgName || "",
    bio: user?.bio || "",
    logo: user?.logo || user?.image || "/default-avatar.png",
    email: user?.email || "",
  }));

  const router = useRouter();
  const { data: session } = useSession();
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    setLocalUser(() => ({
      ...(user || {}),
      orgName: user?.orgName || "",
      bio: user?.bio || "",
      logo: user?.logo || user?.image || "/default-avatar.png",
      email: user?.email || "",
    }));
  }, [user]);

  async function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const filename = `${Date.now()}-${file.name}`;
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
    if (onUserUpdate) {
      // remove undefined keys before sending to backend/prisma
      const payload = Object.fromEntries(
        Object.entries(localUser).filter(([_, v]) => v !== undefined)
      );
      await onUserUpdate(payload);
    }
    setEditMode(false);
  }

  function handleCancel() {
    setLocalUser({
      ...(user || {}),
      orgName: user?.orgName || "",
      bio: user?.bio || "",
      logo: user?.logo || user?.image || "/default-avatar.png",
      email: user?.email || "",
    });
    setEditMode(false);
  }

  if (!user) return <div>Carregando perfil...</div>;

  const displayName = user.orgName || user.name;
  const displayBio = user.bio || "Nenhuma descrição ainda.";
  const displayImage = user.logo || user.image || "/default-avatar.png";
  const displayEmail = user.email || user.orgEmail || "";

  const isOwnProfile = session?.user?.id && Number(session.user.id) === Number(user.id);

  async function startChat(otherUserId) {
    if (isOwnProfile) return;
    setStartingChat(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Erro ao iniciar conversa");
      const conv = await res.json();
      router.push(`/messages?conversationId=${conv.id}`);
    } catch (err) {
      alert(err.message || "Erro ao iniciar conversa");
    } finally {
      setStartingChat(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950 shadow-[0_32px_96px_rgba(15,23,42,0.95)] border border-zinc-800/80 rounded-3xl mb-10 relative overflow-hidden">
      {/* Menu de opções (apenas se showEdit for true) */}
      {showEdit && (
        <div className="absolute top-4 right-4 z-20">
          {!editMode && (
            <button
              type="button"
              aria-label="Mais opções"
              onClick={() => setEditMode(true)}
              className="text-zinc-400 hover:text-white focus:outline-none text-2xl leading-none cursor-pointer"
            >
              &#x22EE;
            </button>
          )}
          {editMode && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}

      <CardContent className="flex flex-col md:flex-row gap-10 px-10 pt-14 pb-10 items-start">
        {/* Logo / avatar */}
        <div className="relative w-[168px] h-[168px] shrink-0">
          <div
            className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-sky-400 via-indigo-400 to-fuchsia-500 opacity-80 blur-md"
            aria-hidden
          />
          <Image
            src={editMode ? localUser.logo : displayImage}
            fill
            sizes="168px"
            className="relative rounded-full border-4 border-zinc-900 object-cover bg-zinc-900"
            alt={`Logo da organização ${displayName}`}
            priority
          />
          {editMode && (
            <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs cursor-pointer border border-zinc-600">
              Trocar
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />
            </label>
          )}
        </div>

        {/* Informações da organização */}
        <div className="flex-1 space-y-5">
          {/* Nome */}
          {editMode ? (
            <Input
              name="orgName"
              value={localUser.orgName || localUser.name || ""}
              onChange={handleChange}
              className="text-3xl font-semibold mb-2"
              maxLength={40}
              placeholder="Nome da organização"
            />
          ) : (
            <p className="text-4xl md:text-[2.6rem] font-extrabold tracking-tight leading-tight">
              {displayName}
            </p>
          )}

          {/* Email */}
          <div className="flex flex-wrap items-center gap-2 text-base">
            <span className="font-medium text-zinc-300">Email:</span>
            {editMode ? (
              <Input
                name="email"
                value={localUser.email || ""}
                onChange={handleChange}
                className="max-w-md bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5"
                placeholder="email@organizacao.com"
              />
            ) : (
              <span className="text-sm text-muted-foreground">
                {displayEmail || "Não informado"}
              </span>
            )}
          </div>

          {/* Bio / descrição */}
          <div>
            <span className="font-medium block text-zinc-300">Descrição:</span>
            {editMode ? (
              <Textarea
                name="bio"
                value={localUser.bio || ""}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-700 rounded mt-1"
                maxLength={200}
                rows={3}
                placeholder="Fale um pouco sobre a organização..."
              />
            ) : (
              <p className="text-zinc-200">
                {displayBio || (
                  <span className="italic text-zinc-500">
                    Nenhuma descrição ainda.
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Botão de mensagem (somente quando não for o próprio perfil) */}
          {!isOwnProfile && (
            <div className="mt-4">
              <Button
                onClick={() => startChat(user.id)}
                className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 text-white font-semibold shadow-[0_12px_35px_rgba(79,70,229,0.6)]"
                disabled={startingChat}
              >
                {startingChat ? "Abrindo..." : "Mensagem"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}