import { useState, useEffect } from "react";
import VagaCard from "../../components/VagaCard";
import VagaDetalhesModal from "../../components/VagaDetalhesModal";
import VagaModalForm from "../../components/VagaModalForm";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";
import { Button } from "../../components/ui/button";

export default function VagasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [showVagaModal, setShowVagaModal] = useState(false);
  const [loadingVagaModal, setLoadingVagaModal] = useState(false);

  // Estados para edição de vaga
  const [editVaga, setEditVaga] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [filtros, setFiltros] = useState({
    pagina: 1,
    ordenar: "recentes",
    termo: "",
    userTypes: [],
    positions: [],
    elos: [],
    city: "",
    state: "",
    tags: []
  });

  const fetchVagas = () => {
    const params = new URLSearchParams();
    params.append("pagina", filtros.pagina);
    params.append("ordenar", filtros.ordenar);
    if (filtros.termo) params.append("termo", filtros.termo);
    filtros.userTypes.forEach(t => params.append("tiposUsuario", t));
    filtros.positions.forEach(p => params.append("posicoes", p));
    filtros.elos.forEach(e => params.append("elos", e));
    if (filtros.city) params.append("cidade", filtros.city);
    if (filtros.state) params.append("estado", filtros.state);
    filtros.tags.forEach(tag => params.append("tags", tag));

    fetch(`/api/vagas?${params.toString()}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(({ vagas }) => {
        setVagas(vagas);
      });
  };

  useEffect(() => {
    fetchVagas();
    // eslint-disable-next-line
  }, [filtros]);

  const handleInput = e => setFiltros(f => ({ ...f, [e.target.name]: e.target.value, pagina: 1 }));

  const handleMultiSelect = (name, value) => {
    setFiltros(f =>
      f[name].includes(value)
        ? { ...f, [name]: f[name].filter(v => v !== value), pagina: 1 }
        : { ...f, [name]: [...f[name], value], pagina: 1 }
    );
  };

  const handleCandidatar = async vagaId => {
    const tipoUsuario = session?.user?.type || session?.user?.tipo;
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para se candidatar." });
      return;
    }
    // Só impede organizações de se candidatar
    if (tipoUsuario === "organization") {
      setConfirmModal({ open: true, message: "Organizações não podem se candidatar!" });
      return;
    }
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura enviada com sucesso!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao candidatar-se!" });
    }
    fetchVagas();
    if (vagaSelecionada && vagaSelecionada.id === vagaId) {
      fetch(`/api/vagas/${vagaId}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setVagaSelecionada(data.vaga));
    }
  };

  const handleDescandidatar = async vagaId => {
    const tipoUsuario = session?.user?.type || session?.user?.tipo;
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para cancelar a candidatura." });
      return;
    }
    if (tipoUsuario === "organization") {
      setConfirmModal({ open: true, message: "Organizações não podem cancelar candidatura!" });
      return;
    }
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "descandidatar" }),
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura cancelada!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao cancelar candidatura!" });
    }
    fetchVagas();
    if (vagaSelecionada && vagaSelecionada.id === vagaId) {
      fetch(`/api/vagas/${vagaId}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setVagaSelecionada(data.vaga));
    }
  };

  const handleSalvar = async vagaId => {
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para salvar vagas." });
      return;
    }
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "salvar" }),
      credentials: "include",
    });
    if (res.ok) {
      setVagas(vagas =>
        vagas.map(v =>
          v.id === vagaId
            ? {
                ...v,
                favorites: [...(v.favorites || []), { userId: session.user.id }],
              }
            : v
        )
      );
      setVagaSelecionada(v =>
        v && v.id === vagaId
          ? { ...v, favorites: [...(v.favorites || []), { userId: session.user.id }] }
          : v
      );
      setConfirmModal({ open: true, message: "Vaga salva!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao salvar vaga!" });
    }
  };

  const handleRemoverSalvo = async vagaId => {
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para remover dos salvos." });
      return;
    }
    const res = await fetch(`/api/vagas/${vagaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remover_salvo" }),
      credentials: "include",
    });
    if (res.ok) {
      setVagas(vagas =>
        vagas.map(v =>
          v.id === vagaId
            ? {
                ...v,
                favorites: (v.favorites || []).filter(f => f.userId !== session.user.id),
              }
            : v
        )
      );
      setVagaSelecionada(v =>
        v && v.id === vagaId
          ? { ...v, favorites: (v.favorites || []).filter(f => f.userId !== session.user.id) }
          : v
      );
      setConfirmModal({ open: true, message: "Vaga removida dos salvos!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao remover vaga dos salvos!" });
    }
  };

  const handleFechar = async vagaId => {
    const tipoUsuario = session?.user?.type || session?.user?.tipo;
    if (!session?.user || tipoUsuario !== "organization") {
      setConfirmModal({ open: true, message: "Somente organizações podem fechar vagas!" });
      return;
    }
    await fetch(`/api/vagas/fechar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId }),
      credentials: "include",
    });
    fetchVagas();
    if (vagaSelecionada && vagaSelecionada.id === vagaId) {
      fetch(`/api/vagas/${vagaId}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setVagaSelecionada(data.vaga));
    }
  };

  const handleDeletar = async vagaId => {
    const tipoUsuario = session?.user?.type || session?.user?.tipo;
    if (!session?.user || tipoUsuario !== "organization") {
      setConfirmModal({ open: true, message: "Somente organizações podem deletar vagas!" });
      return;
    }
    await fetch(`/api/vagas/deletar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId }),
      credentials: "include",
    });
    fetchVagas();
    if (vagaSelecionada && vagaSelecionada.id === vagaId) {
      setVagaSelecionada(null);
    }
  };

  const handleSubmitVaga = async (vagaData) => {
    setLoadingVagaModal(true);
    const res = await fetch("/api/vagas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vagaData),
    });
    setLoadingVagaModal(false);
    if (res.ok) {
      setShowVagaModal(false);
      fetchVagas();
      setConfirmModal({ open: true, message: "Vaga criada com sucesso!" });
    } else {
      setConfirmModal({ open: true, message: "Erro ao criar vaga!" });
    }
  };

  // Novo handler para editar vaga
  const handleEditar = vagaId => {
    const vaga = vagas.find(v => v.id === vagaId);
    setEditVaga(vaga);
    setShowEditModal(true);
  };

  const handleUpdateVaga = async (vagaData) => {
    setLoadingVagaModal(true);
    const res = await fetch(`/api/vagas/${vagaData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vagaData),
      credentials: "include",
    });
    setLoadingVagaModal(false);
    if (res.ok) {
      setShowEditModal(false);
      setEditVaga(null);
      fetchVagas();
      setConfirmModal({ open: true, message: "Vaga atualizada com sucesso!" });
      setVagaSelecionada(null);
    } else {
      setConfirmModal({ open: true, message: "Erro ao atualizar vaga!" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Vagas disponíveis</h1>
        {session?.user?.type === "organization" && (
          <div className="mb-6">
            <Button onClick={() => setShowVagaModal(true)}>
              Abrir vaga
            </Button>
          </div>
        )}
        <div className="mb-6">{/* ...filtros... */}</div>
        {vagas.length === 0 ? (
          <p className="text-center text-zinc-400 mt-16">Nenhuma vaga encontrada.</p>
        ) : (
          <div className="space-y-6">
            {vagas.map(vaga => (
              <VagaCard
                key={vaga.id}
                vaga={vaga}
                usuario={session?.user}
                onCandidatar={handleCandidatar}
                onDescandidatar={handleDescandidatar} 
                onSalvar={handleSalvar}
                onRemoverSalvo={handleRemoverSalvo}
                onFechar={handleFechar}
                onDeletar={handleDeletar}
                onShowDetails={() => {
                  const vagaAtual = vagas.find(v => v.id === vaga.id);
                  setVagaSelecionada(vagaAtual || vaga);
                }}
              />
            ))}
          </div>
        )}
        {/* Paginação */}
        <div className="flex items-center justify-center mt-8 gap-6">
          <button
            onClick={() => setFiltros(f => ({ ...f, pagina: Math.max(1, f.pagina - 1) }))}
            disabled={filtros.pagina === 1}
            className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 disabled:bg-zinc-900"
          >
            Anterior
          </button>
          <span>Página {filtros.pagina}</span>
          <button
            onClick={() => setFiltros(f => ({ ...f, pagina: f.pagina + 1 }))}
            disabled={vagas.length < 10}
            className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 disabled:bg-zinc-900"
          >
            Próxima
          </button>
        </div>
      </div>
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
      {vagaSelecionada && (
        <VagaDetalhesModal
          vaga={vagaSelecionada}
          usuario={session?.user}
          onClose={() => setVagaSelecionada(null)}
          onCandidatar={handleCandidatar}
          onDescandidatar={handleDescandidatar} 
          onSalvar={handleSalvar}
          onRemoverSalvo={handleRemoverSalvo}
          onFechar={handleFechar}
          onDeletar={handleDeletar}
          onEditar={vagaId => handleEditar(vagaId)}
        />
      )}
      {/* Modal de criar vaga usando componente */}
      <VagaModalForm
        open={showVagaModal}
        onClose={() => setShowVagaModal(false)}
        onSubmit={handleSubmitVaga}
        loading={loadingVagaModal}
      />
      {/* Modal de editar vaga usando o mesmo componente */}
      <VagaModalForm
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditVaga(null);}}
        onSubmit={handleUpdateVaga}
        loading={loadingVagaModal}
        initialValues={editVaga}
        editing
      />
    </div>
  );
}