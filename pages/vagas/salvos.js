import { useEffect, useState } from "react";
import VagaCard from "../../components/VagaCard";
import { useSession } from "next-auth/react";

export default function VagasSalvasPage() {
  const { data: session } = useSession();
  const [vagas, setVagas] = useState([]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/vagas/salvas").then(res => res.json()).then(({ vagas }) => setVagas(vagas));
  }, [session]);

  if (vagas.length === 0) return <p>Nenhuma vaga salva.</p>;
  return (
    <div>
      <h1>Vagas salvas</h1>
      {vagas.map(vaga => (
        <VagaCard key={vaga.id} vaga={vaga} usuario={session?.user} />
      ))}
    </div>
  );
}