import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

export default function OrganizationProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [org, setOrg] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [localOrg, setLocalOrg] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organization/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrg(data.organization);
        setLocalOrg(data.organization);
        setLoading(false);
      });
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => setVagas(data.vagas || []));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setLocalOrg(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    const res = await fetch(`/api/organization/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localOrg),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrg(updated.organization);
      setLocalOrg(updated.organization);
      setEditMode(false);
      alert("Perfil salvo com sucesso!");
    } else {
      alert("Erro ao salvar perfil.");
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando...</div>;
  if (!org) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Organização não encontrada.</div>;

  const displayName = localOrg?.orgName || localOrg?.name;
  const displayBio = localOrg?.orgDesc || localOrg?.bio;
  const displayImage = localOrg?.logo || localOrg?.image || "/default-org.png";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Perfil da Organização</h1>
      <div className="flex flex-col items-center mb-8 relative w-full max-w-2xl">
        <Image
          src={displayImage}
          width={120}
          height={120}
          className="rounded-full border-4 border-zinc-700"
          alt="Logo da organização"
        />
        {org.isCurrentUser && (
          <div className="absolute top-4 right-4">
            {!editMode ? (
              <Button size="sm" onClick={() => setEditMode(true)}>Editar Perfil</Button>
            ) : (
              <Button size="sm" onClick={handleSave}>Salvar</Button>
            )}
          </div>
        )}
        {editMode ? (
          <>
            <Input
              name="orgName"
              value={localOrg.orgName || ""}
              onChange={handleChange}
              className="text-2xl font-semibold mt-4 mb-2"
              placeholder="Nome da Organização"
            />
            <Input
              name="email"
              value={localOrg.email || ""}
              onChange={handleChange}
              className="mb-2"
              placeholder="Email"
            />
            <Textarea
              name="orgDesc"
              value={localOrg.orgDesc || ""}
              onChange={handleChange}
              className="mb-2"
              placeholder="Descrição/Bio"
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mt-4 mb-2">{displayName}</h2>
            <p className="text-zinc-400 mb-2">{org.email}</p>
            {displayBio ? (
              <p className="text-zinc-300 mb-2">{displayBio}</p>
            ) : (
              <p className="italic text-zinc-600 mb-2">Nenhuma descrição ainda.</p>
            )}
          </>
        )}
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Vagas abertas</h2>
        {vagas.length === 0 ? (
          <p className="text-zinc-500 text-center">Nenhuma vaga aberta.</p>
        ) : (
          <div className="space-y-4">
            {vagas.map(vaga => (
              <div key={vaga.id} className="bg-zinc-900 rounded-xl p-5 shadow">
                <h3 className="text-lg font-bold">{vaga.titulo || vaga.title}</h3>
                <p className="text-zinc-300 mb-2">{vaga.descricao || vaga.description}</p>
                <span className="text-xs text-zinc-400">
                  Publicada em {vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}
                </span>
                <div className="mt-2">
                  <Button size="sm" onClick={() => router.push(`/vagas/${vaga.id}`)}>
                    Ver vaga
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}