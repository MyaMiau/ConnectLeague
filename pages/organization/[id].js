import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "../../components/ui/button";

export default function OrganizationProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [org, setOrg] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organization/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrg(data.organization);
        setLoading(false);
      });
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => setVagas(data.vagas || []));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando...</div>;
  if (!org) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Organização não encontrada.</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Perfil da Organização</h1>
      <div className="flex flex-col items-center mb-8">
        <Image
          src={org.logo || org.image || "/default-org.png"}
          width={120}
          height={120}
          className="rounded-full border-4 border-zinc-700"
          alt="Logo da organização"
        />
        <h2 className="text-2xl font-semibold mt-4 mb-2">{org.orgName || org.name}</h2>
        {org.cnpj && (
          <p className="text-zinc-500 mb-2">CNPJ: {org.cnpj}</p>
        )}
        <p className="text-zinc-400 mb-2">{org.email}</p>
        {org.orgDesc || org.bio ? (
          <p className="text-zinc-300 mb-2">{org.orgDesc || org.bio}</p>
        ) : (
          <p className="italic text-zinc-600 mb-2">Nenhuma descrição ainda.</p>
        )}
        {/* Botão de edição se for a própria org logada */}
        {org.isCurrentUser && (
          <Button onClick={() => router.push(`/organization/edit?id=${org.id}`)}>
            Editar Perfil
          </Button>
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