import { useState, useEffect } from "react";
import VagaCard from "../../components/VagaCard";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";

export default function VagasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);
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

  // Função para buscar vagas
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

    fetch(`/api/vagas?${params.toString()}`)
      .then(res => res.json())
      .then(({ vagas }) => setVagas(vagas));
  };

  useEffect(() => {
    fetchVagas();
    // eslint-disable-next-line
  }, [filtros]);

  // Handlers para filtros
  const handleInput = e => setFiltros(f => ({ ...f, [e.target.name]: e.target.value, pagina: 1 }));

  const handleMultiSelect = (name, value) => {
    setFiltros(f =>
      f[name].includes(value)
        ? { ...f, [name]: f[name].filter(v => v !== value), pagina: 1 }
        : { ...f, [name]: [...f[name], value], pagina: 1 }
    );
  };

  // Funções dos botões do card
  const handleCandidatar = async vagaId => {
    if (!session?.user) return;
    await fetch(`/api/vagas/candidatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId })
    });
    fetchVagas();
  };

  const handleSalvar = async vagaId => {
    if (!session?.user) return;
    await fetch(`/api/vagas/salvar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId })
    });
    fetchVagas();
  };

  const handleFechar = async vagaId => {
    await fetch(`/api/vagas/fechar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId })
    });
    fetchVagas();
  };

  const handleDeletar = async vagaId => {
    await fetch(`/api/vagas/deletar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vagaId })
    });
    fetchVagas();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Vagas disponíveis</h1>
        {/* Filtros, se quiser pode deixar aqui */}
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
                onSalvar={handleSalvar}
                onFechar={handleFechar}
                onDeletar={handleDeletar}
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
    </div>
  );
}