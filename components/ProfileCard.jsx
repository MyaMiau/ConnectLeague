import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const ROLES = [
  { name: "Top", icon: "/Top.png" },
  { name: "Jungle", icon: "/Jg.png" },
  { name: "Mid", icon: "/Mid.png" },
  { name: "ADC", icon: "/Adc.png" },
  { name: "Support", icon: "/Sup.png" }
];
const ELOS = [
  { name: "Ferro", image: "/Ferro.png" },
  { name: "Bronze", image: "/Bronze.png" },
  { name: "Prata", image: "/Prata.png" },
  { name: "Ouro", image: "/Ouro.png" },
  { name: "Platina", image: "/Platina.png" },
  { name: "Esmeralda", image: "/Esmeralda.png" },
  { name: "Diamante", image: "/Diamante.png" },
  { name: "Mestre", image: "/Mestre.png" },
  { name: "Grão-Mestre", image: "/GraoMestre.png" },
  { name: "Desafiante", image: "/Desafiante.png" }
];

export default function ProfileCard({ user, onUserUpdate, showEdit = true }) {
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [localUser, setLocalUser] = useState(() => ({
    ...(user || {}),
    id: user?.id,
    status: user?.status || "Free Agent",
  }));
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    setLocalUser(prev => ({
      ...(user || {}),
      id: user?.id,
      status: user?.status || "Free Agent",
    }));
  }, [user]);

  // Se não há user, mostra carregando
  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setLocalUser((prev) => ({ ...prev, [name]: value }));
  }

  // Novo handleImage para upload no servidor e salvar só a URL
  async function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const filename = `${Date.now()}-${file.name}`;

        // Envia para API que salva a imagem em /public/uploads e retorna a URL
        const res = await fetch("/api/upload-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename }),
        });
        if (res.ok) {
          const { url } = await res.json();
          setLocalUser((prev) => ({ ...prev, image: url }));
        } else {
          alert("Erro ao fazer upload da imagem.");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSave() {
    try {
      console.log('Enviando para o backend:', localUser);
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localUser),
      });
      if (!response.ok) {
        throw new Error('Erro ao salvar o perfil!');
      }
      const updatedUser = await response.json();
      setEditMode(false);
      setShowMenu(false);
      setLocalUser(updatedUser);
      if (onUserUpdate) onUserUpdate(updatedUser);
      alert('Perfil salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar perfil: ' + error.message);
    }
  }

  const selectedRole = ROLES.find(r => r.name === localUser.role);
  const selectedElo = ELOS.find(e => e.name === localUser.elo);

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
      if (!res.ok) {
        throw new Error("Erro ao iniciar conversa");
      }
      const conv = await res.json();
      router.push(`/messages?conversationId=${conv.id}`);
    } catch (err) {
      alert(err.message || "Erro ao iniciar conversa");
    } finally {
      setStartingChat(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl bg-zinc-900 shadow-xl rounded-2xl mb-6 relative">
      {/* Menu de 3 pontinhos */}
      {showEdit && (
        <div className="absolute top-4 right-4 z-20">
          <button
            aria-label="mais opções"
            className="text-zinc-400 hover:text-white focus:outline-none text-2xl leading-none cursor-pointer"
            onClick={() => setShowMenu(v => !v)}
          >
            &#x22EE;
          </button>
          {showMenu && !editMode && (
            <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded shadow-md z-30 cursor-pointer">
              <button
                onClick={() => { setEditMode(true); setShowMenu(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
              >
                Editar Perfil
              </button>
            </div>
          )}
        </div>
      )}
      <CardContent className="flex flex-col md:flex-row gap-6 p-6 items-center md:items-start">
        {/* Avatar */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <Image
            src={localUser.image || "/default-avatar.png"}
            fill
            sizes="120px"
            className="rounded-full border-4 border-zinc-700 object-cover"
            alt="Avatar do Jogador"
            priority
          />
          {editMode && (
            <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs cursor-pointer border border-zinc-600">
              Trocar
              <Input type="file" accept="image/*"
                className="hidden"
                onChange={handleImage} />
            </label>
          )}
        </div>

        {/* User info */}
        <div className="flex-1 space-y-3 mt-4 md:mt-0">
          {/* Nome */}
          {editMode ? (
            <Input
              name="name"
              value={localUser.name}
              onChange={handleChange}
              className="text-xl font-semibold mb-2"
              maxLength={20}
            />
          ) : (
            <p className="text-2xl font-bold">{localUser.name}</p>
          )}

          {/* Função (Role) */}
          <div className="flex gap-2 items-center">
            <span className="font-medium">Função:</span>
            {editMode ? (
              <select
                name="role"
                value={localUser.role || ""}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
              >
                <option value="">Selecione...</option>
                {ROLES.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            ) : (
              <span className="flex items-center gap-2 px-2 py-1 rounded bg-purple-800/40 text-purple-300 font-semibold">
                {selectedRole && (
                  <Image
                    src={selectedRole.icon}
                    alt={selectedRole.name}
                    width={24}
                    height={24}
                    priority
                  />
                )}
                {localUser.role}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="flex gap-2 items-center">
            <span className="font-medium">Status:</span>
            {editMode ? (
              <select
                name="status"
                value={localUser.status || ""}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
              >
                <option value="Free Agent">Free Agent</option>
                <option value="Em time">Em time</option>
              </select>
            ) : (
              <span className={`px-2 py-1 rounded font-semibold
                ${localUser.status === "Free Agent"
                  ? "bg-green-700/30 text-green-300"
                  : "bg-zinc-700/50 text-zinc-300"
                }`}>
                {localUser.status}
              </span>
            )}
          </div>

          {/* Elo */}
          <div className="flex flex-col items-start mt-2">
            {!editMode && selectedElo && (
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={selectedElo.image}
                  alt={selectedElo.name}
                  width={100}
                  height={100}
                  className="drop-shadow-xl"
                  priority
                />
              </div>
            )}
            {editMode && (
              <div className="flex flex-col gap-1">
                <label className="font-medium">Elo:</label>
                <select
                  name="elo"
                  value={localUser.elo || ""}
                  onChange={handleChange}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
                >
                  <option value="">Selecione...</option>
                  {ELOS.map((e) => (
                    <option key={e.name} value={e.name}>{e.name}</option>
                  ))}
                </select>
                {selectedElo && (
                  <Image
                    src={selectedElo.image}
                    alt={selectedElo.name}
                    width={48}
                    height={48}
                    className="mt-1"
                    priority
                  />
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <span className="font-medium block">Bio:</span>
            {editMode ? (
              <Textarea
                name="bio"
                value={localUser.bio}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-700 rounded mt-1"
                maxLength={120}
                rows={2}
              />
            ) : (
              <p className="text-zinc-300">{localUser.bio || <span className="italic text-zinc-500">Nenhuma descrição ainda.</span>}</p>
            )}
          </div>

          {/* Botão de Mensagem (apenas quando não for o próprio perfil) */}
          {!isOwnProfile && (
            <div className="mt-3">
              <Button onClick={() => startChat(user.id)} className="bg-purple-600 hover:bg-purple-700" disabled={startingChat}>
                {startingChat ? "Abrindo..." : "Mensagem"}
              </Button>
            </div>
          )}

          {/* Botão salvar apenas no modo edição */}
          {editMode && (
            <div className="mt-3">
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">Salvar</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}