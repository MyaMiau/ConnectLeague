import { useState, useEffect } from "react";
import VagaCard from "../../components/VagaCard";
import { useSession } from "next-auth/react";

const posicoesDisponiveis = ["Top", "Jungle", "Mid", "ADC", "Suporte"];
const tiposUsuarioDisponiveis = ["Jogador", "Coach", "Manager", "Psicólogo", "Designer"];
const elosDisponiveis = ["Diamante+", "Platina+", "Ouro+", "Prata+", "Bronze+"];

export default function VagasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);
  const [filtros, setFiltros] = useState({ pagina: 1, ordenar: "recentes" });

  useEffect(() => {
    const params = new URLSearchParams(filtros);
    fetch(`/api/vagas?${params.toString()}`).then(res => res.json()).then(({ vagas }) => setVagas(vagas));
  }, [filtros]);

  return (
    <div>
      <h1>Vagas disponíveis</h1>
      {/* Filtros */}
      {/* Inputs para filtros e busca */}
      {vagas.length === 0 ? (
        <p>Nenhuma vaga encontrada.</p>
      ) : (
        vagas.map(vaga => (
          <VagaCard key={vaga.id} vaga={vaga} usuario={session?.user} />
        ))
      )}
      {/* Paginação */}
      <button onClick={() => setFiltros(f => ({ ...f, pagina: Math.max(1, f.pagina - 1) }))}>Anterior</button>
      <span>{filtros.pagina}</span>
      <button onClick={() => setFiltros(f => ({ ...f, pagina: f.pagina + 1 }))}>Próxima</button>
    </div>
  );
}