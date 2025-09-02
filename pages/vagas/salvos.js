import { useEffect, useState } from "react";
import VagaCard from "../../components/VagaCard";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";

export default function VagasSalvasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });

  const fetchSalvos = () => {
    fetch("/api/vagas/salvas")
      .then(res => res.json())
      .then(({ vagas }) => setVagas(vagas));
  };

  useEffect(() => {
    if (!session) return;
    fetchSalvos();
  }, [session]);

  const handleRemoverSalvo = async vagaId => {
    await fetch(`/api/vagas/remover-salvo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId })
    });
    setConfirmModal({ open: true, message: "Vaga removida dos salvos!" });
    fetchSalvos();
  };

  if (!session) return <p>Faça login para ver suas vagas salvas.</p>;
  if (vagas.length === 0) return <p>Nenhuma vaga salva.</p>;
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Vagas salvas</h1>
        <div className="space-y-6">
          {vagas.map(vaga => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              usuario={session?.user}
              onSalvar={handleRemoverSalvo}
            />
          ))}
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
    </div>
  );
}