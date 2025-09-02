import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { Button } from "../../components/ui/button";
import { useSession } from "next-auth/react";

export default function VagaDetalhes() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [vaga, setVaga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });
  const [jaCandidatado, setJaCandidatado] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vagas/${id}`)
      .then(res => res.json())
      .then(data => {
        setVaga(data.vaga);
        setLoading(false);
        if (session?.user && data.vaga?.candidatos?.some(c => c.usuarioId === session.user.id)) {
          setJaCandidatado(true);
        }
      });
  }, [id, session]);

  const handleCandidatar = async () => {
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para se candidatar." });
      return;
    }
    const res = await fetch(`/api/vagas/candidatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId: vaga.id })
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura enviada com sucesso!" });
      setJaCandidatado(true);
    } else {
      setConfirmModal({ open: true, message: "Erro ao candidatar-se!" });
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white"><Header /><p className="text-center mt-24">Carregando vaga...</p></div>;
  if (!vaga) return <div className="min-h-screen bg-black text-white"><Header /><p className="text-center mt-24">Vaga não encontrada.</p></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">{vaga.titulo}</h1>
        <div className="flex gap-6 items-center mb-6">
          <img
            src={vaga.organizacao?.logo || "/default-org.png"}
            alt="Logo Organização"
            className="w-16 h-16 rounded-full bg-zinc-800 border"
          />
          <div>
            <p className="font-semibold text-lg">{vaga.organizacao?.nome}</p>
            <Button variant="outline" asChild>
              <a href={`/profile/${vaga.organizacao?.id}`}>Ver perfil da organização</a>
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-700 text-white font-semibold">{vaga.status}</span>
          <span className="ml-3 text-zinc-400">Publicada em {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : "?"}</span>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Descrição completa</h2>
          <p className="text-zinc-200">{vaga.descricaoCompleta || vaga.descricao}</p>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Requisitos</h2>
          <ul className="list-disc pl-6 text-zinc-200">
            {vaga.requisitos?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Benefícios</h2>
          <ul className="list-disc pl-6 text-zinc-200">
            {vaga.beneficios?.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div className="mb-6">
          <span className="text-zinc-400"><strong>Posições:</strong> {vaga.posicoes?.join(", ")}</span> <br />
          <span className="text-zinc-400"><strong>Elo mínimo:</strong> {vaga.elos?.join(", ")}</span> <br />
          <span className="text-zinc-400"><strong>Localização:</strong> {vaga.cidade}/{vaga.estado}</span> <br />
          {vaga.tags?.length > 0 && <span className="text-zinc-400"><strong>Tags:</strong> {vaga.tags.join(", ")}</span>}
        </div>
        <div className="mb-6">
          <span className="text-zinc-400"><strong>Candidatos:</strong> {vaga.candidatos?.length || 0}</span>
        </div>
        {/* Botão de candidatura */}
        <Button
          variant="default"
          disabled={jaCandidatado}
          onClick={handleCandidatar}
          aria-label={jaCandidatado ? "Já candidatado" : "Candidatar-se"}
        >
          {jaCandidatado ? "Candidatado" : "Candidatar-se"}
        </Button>
      </div>
      {/* Modal de confirmação */}
      {confirmModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-zinc-900 p-8 rounded-xl shadow-xl text-center">
            <p className="text-lg">{confirmModal.message}</p>
            <button
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-800"
              onClick={() => setConfirmModal({ open: false, message: "" })}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}