import Modal from "./Modal";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

export default function VagaModal({
  vaga,
  usuario,
  onCandidatar,
  onDescandidatar,
  onFechar,
  onDeletar,
  onEditar,
  onClose
}) {
  if (!vaga) return null;

  const candidatos = vaga.applications || [];
  const organizacao = vaga.organization || {};

  const jaCandidatado = candidatos.some(
    app => Number(app.user_id) === Number(usuario?.id)
  );
  const isOrg =
    usuario?.type === "organizacao" && usuario?.id === organizacao.id;

  const localizacao =
    vaga.city && vaga.state
      ? `${vaga.city}/${vaga.state}`
      : vaga.city || vaga.state || "";

  return (
    <Modal open={!!vaga} onClose={onClose}>
      <div>
        <h2 className="text-2xl font-bold mb-2">{vaga.title}</h2>
        <div className="flex items-center gap-3 mb-2">
          <Image
            src={
              organizacao.logo ||
              organizacao.image ||
              "/default-avatar.png"}
            alt="Logo"
            width={48}
            height={48}
            className="rounded-full bg-zinc-800 object-cover border"
            priority />
          <span className="block text-zinc-400">{organizacao.orgName || organizacao.name}</span>
        </div>

        <div className="mb-2">{vaga.description}</div>

        {vaga.requirements && (
          <div className="mb-1"><strong>Requisitos:</strong> {vaga.requirements}</div>
        )}
        {vaga.benefits && (
          <div className="mb-1"><strong>Benefícios:</strong> {vaga.benefits}</div>
        )}

        <div className="mb-1"><strong>Posições:</strong> {vaga.positions?.join(", ") || "Não informado"}</div>
        <div className="mb-1"><strong>Tipos de usuário:</strong> {vaga.userTypes?.join(", ") || "Não informado"}</div>
        <div className="mb-1"><strong>Elo:</strong> {vaga.elos?.join(", ") || "Não informado"}</div>
        <div className="mb-1"><strong>Localização:</strong> {localizacao || "Não informado"}</div>
        <div className="mb-1"><strong>Tags:</strong> {vaga.tags?.join(", ") || "Nenhuma"}</div>
        <div className="mb-1"><strong>Status:</strong> {vaga.status}</div>
        <div className="mb-1"><strong>Publicado em:</strong> {vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}</div>

        <div className="mb-3 text-zinc-400 text-sm">
          <strong>Candidatos:</strong> {candidatos.length}
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          <Link href={`/organizacao/${organizacao.id}`}>
            <Button variant="outline" className="mb-2">Ver perfil da organização</Button>
          </Link>
          {!isOrg && (
        <Button
          color={jaCandidatado ? "red" : "green"}
          onClick={() => {
            if (jaCandidatado) {
              onDescandidatar?.(vaga.id);
            } else {
              onCandidatar?.(vaga.id);
            }
          }}
          disabled={vaga.status !== "Aberta"}
        >
          {vaga.status !== "Aberta" ? "Vaga Fechada" : (jaCandidatado ? "Descandidatar" : "Candidatar-se")}
        </Button>
          )}
          {isOrg && (
            <>
              <Button onClick={() => onFechar?.(vaga.id)}>
                {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
              </Button>
              <Button color="red" onClick={() => onDeletar?.(vaga.id)}>Deletar</Button>
              <Button variant="outline" onClick={() => onEditar?.(vaga)}>
                Editar
              </Button>
              <div style={{ marginTop: "16px" }}>
                <h3 className="font-semibold mb-1">Candidatos:</h3>
                {candidatos.length > 0 ? (
                  candidatos.map(c => (
                    <div key={c.user_id}>
                      {c.user?.name || "Sem nome"} ({c.user?.type || "?"})
                    </div>
                  ))
                ) : (
                  <div>Nenhum candidato ainda.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}