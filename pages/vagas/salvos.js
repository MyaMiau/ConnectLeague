import { useEffect, useState } from "react";
import VagaCard from "../../components/VagaCard";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";
import VagaModal from "../../components/VagaModal";

export default function VagasSalvasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });
  const [detalheVaga, setDetalheVaga] = useState(null);

  const fetchSalvos = () => {
    fetch("/api/vagas/salvas")
      .then(res => res.json())
      .then(({ vagas }) => setVagas(Array.isArray(vagas) ? vagas : []));
  };

  useEffect(() => {
    if (!session) return;
    fetchSalvos();
  }, [session]);

  // Remove dos salvos imediatamente da lista
  const handleRemoverSalvo = async vagaId => {
    await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remover_salvo" }),
    });
    setVagas(prev => prev.filter(v => v.id !== vagaId));
    setConfirmModal({ open: true, message: "Vaga removida dos salvos!" });
  };

  // Opcional: handler para salvar caso deseje permitir salvar novamente na página de salvos
  const handleSalvar = async vagaId => {
    await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "salvar" }),
    });
    // Aqui normalmente não precisa atualizar a lista porque já está em salvos
    setConfirmModal({ open: true, message: "Vaga salva!" });
  };

  const handleCandidatar = async vagaId => {
    await fetch(`/api/vagas/candidatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId })
    });
    setConfirmModal({ open: true, message: "Candidatado com sucesso!" });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <p>Faça login para ver suas vagas salvas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Vagas salvas</h1>
        <div className="space-y-6">
          {vagas.length === 0 ? (
            <p className="text-center text-zinc-400 mt-16">Nenhuma vaga salva.</p>
          ) : (
            vagas.map(vaga => (
              <VagaCard
                key={vaga.id}
                vaga={vaga}
                usuario={session?.user}
                onSalvar={handleSalvar}
                onRemoverSalvo={handleRemoverSalvo}
                onCandidatar={handleCandidatar}
                onShowDetails={setDetalheVaga}
              />
            ))
          )}
        </div>
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
      {/* Modal de detalhes igual página de vagas */}
      {detalheVaga && (
        <VagaModal
          vaga={detalheVaga}
          usuario={session?.user}
          onCandidatar={handleCandidatar}
          onClose={() => setDetalheVaga(null)}
        />
      )}
    </div>
  );
}