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
    fetch(`/api/vagas/${id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setVaga(data.vaga);
        setLoading(false);
        if (session?.user && data.vaga?.applications?.some(app => Number(app.user_id) === Number(session.user.id))) {
          setJaCandidatado(true);
        }
      });
  }, [id, session]);

  const handleCandidatar = async () => {
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para se candidatar." });
      return;
    }
    const res = await fetch(`/api/vagas/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura enviada com sucesso!" });
      setJaCandidatado(true);
      // Atualiza candidatos localmente
      setVaga(prev =>
        prev
          ? {
              ...prev,
              applications: [
                ...(prev.applications || []),
                { user_id: session.user.id, user: session.user }
              ]
            }
          : prev
      );
    } else {
      setConfirmModal({ open: true, message: "Erro ao candidatar-se!" });
    }
  };

  const handleDescandidatar = async () => {
    if (!session?.user) return;
    const res = await fetch(`/api/vagas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "descandidatar" }),
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura cancelada!" });
      setJaCandidatado(false);
      setVaga(prev =>
        prev
          ? {
              ...prev,
              applications: (prev.applications || []).filter(app => Number(app.user_id) !== Number(session.user.id))
            }
          : prev
      );
    } else {
      setConfirmModal({ open: true, message: "Erro ao cancelar candidatura!" });
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white"><Header /><p className="text-center mt-24">Carregando vaga...</p></div>;
  if (!vaga) return <div className="min-h-screen bg-black text-white"><Header /><p className="text-center mt-24">Vaga não encontrada.</p></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">{vaga.titulo || vaga.title}</h1>
        <div className="flex gap-6 items-center mb-6">
          <img
            src={vaga.organization?.logo || "/default-org.png"}
            alt="Logo Organização"
            className="w-16 h-16 rounded-full bg-zinc-800 border"
          />
          <div>
            <p className="font-semibold text-lg">{vaga.organization?.name}</p>
            <Button variant="outline" asChild>
              <a href={`/profile/${vaga.organization?.id}`}>Ver perfil da organização</a>
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-700 text-white font-semibold">{vaga.status}</span>
          <span className="ml-3 text-zinc-400">Publicada em {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}</span>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Descrição completa</h2>
          <p className="text-zinc-200">{vaga.descricaoCompleta || vaga.descricao || vaga.description}</p>
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
          <span className="text-zinc-400"><strong>Posições:</strong> {vaga.posicoes?.join(", ") || vaga.positions?.join(", ") || "—"}</span> <br />
          <span className="text-zinc-400"><strong>Elo mínimo:</strong> {vaga.elos?.join(", ") || "—"}</span> <br />
          <span className="text-zinc-400"><strong>Localização:</strong> {vaga.cidade || vaga.city || ""}{(vaga.cidade || vaga.city) && (vaga.estado || vaga.state) ? "/" : ""}{vaga.estado || vaga.state || ""}</span> <br />
          {vaga.tags?.length > 0 && <span className="text-zinc-400"><strong>Tags:</strong> {vaga.tags.join(", ")}</span>}
        </div>
        <div className="mb-6">
          <span className="text-zinc-400"><strong>Candidatos:</strong> {vaga.applications?.length || 0}</span>
        </div>
        <Button
          variant={jaCandidatado ? "secondary" : "default"}
          disabled={false}
          onClick={jaCandidatado ? handleDescandidatar : handleCandidatar}
          aria-label={jaCandidatado ? "Cancelar candidatura" : "Candidatar-se"}
        >
          {jaCandidatado ? "Cancelar candidatura" : "Candidatar-se"}
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