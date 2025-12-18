import { useEffect, useState } from "react";
import VagaCard from "../../components/VagaCard";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";
import VagaDetalhesModal from "../../components/VagaDetalhesModal";

export default function VagasSalvasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);
  const [detalheVaga, setDetalheVaga] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });

  // Busca as vagas salvas do usuário autenticado
  const fetchSalvos = () => {
    fetch("/api/vagas/salvas", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(({ vagas }) => setVagas(Array.isArray(vagas) ? vagas : []));
  };

  useEffect(() => {
    if (!session) return;
    fetchSalvos();
  }, [session]);

  // Remove vaga dos salvos e já remove da lista local e do modal 
  const handleRemoverSalvo = async vagaId => {
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remover_salvo" }),
      credentials: "include",
    });
    if (res.ok) {
      setVagas(vagas => vagas.filter(v => v.id !== vagaId));
      setDetalheVaga(det => det && det.id === vagaId ? null : det);
      setConfirmModal({ open: true, message: "Vaga removida dos salvos!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao remover vaga dos salvos!" });
    }
  };

  // Salva a vaga e já atualiza localmente para refletir no modal/card
  const handleSalvarVaga = async vagaId => {
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "salvar" }),
      credentials: "include",
    });
    if (res.ok) {
      setVagas(vagas => vagas.map(v =>
        v.id === vagaId
          ? { ...v, favorites: [...(v.favorites || []), { userId: session.user.id }] }
          : v
      ));
      setDetalheVaga(det => det && det.id === vagaId
        ? { ...det, favorites: [...(det.favorites || []), { userId: session.user.id }] }
        : det
      );
      setConfirmModal({ open: true, message: "Vaga salva!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao salvar vaga!" });
    }
  };

  // Candidatar-se e atualizar estado local/modal
  const handleCandidatar = async vagaId => {
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para se candidatar." });
      return;
    }
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatado com sucesso!" });
      // Atualiza localmente a lista e modal
      setVagas(vagas =>
        vagas.map(v =>
          v.id === vagaId
            ? {
                ...v,
                applications: [...(v.applications || []), { user_id: session.user.id, user: session.user }],
              }
            : v
        )
      );
      setDetalheVaga(det =>
        det && det.id === vagaId
          ? {
              ...det,
              applications: [...(det.applications || []), { user_id: session.user.id, user: session.user }],
            }
          : det
      );
    } else {
      setConfirmModal({ open: true, message: "Erro ao candidatar-se!" });
    }
  };

  // Descandidatar-se e atualizar estado local/modal
  const handleDescandidatar = async vagaId => {
    if (!session?.user) return;
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "descandidatar" }),
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura cancelada!" });
      setVagas(vagas =>
        vagas.map(v =>
          v.id === vagaId
            ? {
                ...v,
                applications: (v.applications || []).filter(app => Number(app.user_id) !== Number(session.user.id)),
              }
            : v
        )
      );
      setDetalheVaga(det =>
        det && det.id === vagaId
          ? {
              ...det,
              applications: (det.applications || []).filter(app => Number(app.user_id) !== Number(session.user.id)),
            }
          : det
      );
    } else {
      setConfirmModal({ open: true, message: "Erro ao cancelar candidatura!" });
    }
  };

  const handleFechar = async vagaId => {
    if (!session?.user) return;
    const vaga = vagas.find(v => v.id === vagaId);
    const novoStatus = vaga.status === "Aberta" ? "Fechada" : "Aberta";
    await fetch(`/api/vagas/${vagaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
      credentials: "include",
    });
    fetchSalvos();
    setDetalheVaga(det => det && det.id === vagaId ? { ...det, status: novoStatus } : det);
  };

  const handleDeletar = async vagaId => {
    if (!session?.user) return;
    await fetch(`/api/vagas/${vagaId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setVagas(vagas => vagas.filter(v => v.id !== vagaId));
    setDetalheVaga(det => det && det.id === vagaId ? null : det);
    setConfirmModal({ open: true, message: "Vaga deletada!" });
  };

  const handleEditar = vagaId => {
    setConfirmModal({ open: true, message: "Função de editar vaga ainda não implementada nesta página!" });
  };

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64">
          <div className="max-w-4xl mx-auto py-10 px-4">
            <p className="text-muted-foreground">
              Faça login para ver suas vagas salvas.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pl-64">
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
          <h1 className="section-title mb-2">Vagas salvas</h1>
          <p className="text-muted-foreground">
            Revise e gerencie as vagas que você marcou para ver depois.
          </p>
          <div className="space-y-4 mt-4">
            {vagas.length === 0 ? (
              <p className="text-center text-muted-foreground mt-12">
                Nenhuma vaga salva.
              </p>
            ) : (
              vagas.map((vaga) => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  usuario={session?.user}
                  onRemoverSalvo={handleRemoverSalvo}
                  onSalvar={handleSalvarVaga}
                  onCandidatar={handleCandidatar}
                  onDescandidatar={handleDescandidatar}
                  onShowDetails={() => {
                    const vagaAtual = vagas.find((v) => v.id === vaga.id);
                    setDetalheVaga(vagaAtual || vaga);
                  }}
                  onFechar={handleFechar}
                  onDeletar={handleDeletar}
                  onEditar={handleEditar}
                />
              ))
            )}
          </div>
        </div>

        {/* Modal de confirmação */}
        {confirmModal.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="card-glow bg-card p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
              <p className="text-base text-foreground">{confirmModal.message}</p>
              <button
                className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold"
                onClick={() => setConfirmModal({ open: false, message: "" })}
              >
                Ok
              </button>
            </div>
          </div>
        )}

        {detalheVaga && (
          <VagaDetalhesModal
            vaga={detalheVaga}
            usuario={session?.user}
            onClose={() => setDetalheVaga(null)}
            onCandidatar={handleCandidatar}
            onDescandidatar={handleDescandidatar}
            onSalvar={handleSalvarVaga}
            onRemoverSalvo={handleRemoverSalvo}
            onFechar={handleFechar}
            onDeletar={handleDeletar}
            onEditar={handleEditar}
          />
        )}
      </div>
    </>
  );
}