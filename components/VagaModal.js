import { Modal } from "./Modal";
import { Button } from "./Button";
import Link from "next/link";

export default function VagaModal({ vaga, usuario, onCandidatar, onFechar, onDeletar, onClose }) {
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id);
  const isOrg = usuario?.tipo === "organizacao" && usuario?.id === vaga.organizacaoId;

  return (
    <Modal open={!!vaga} onClose={onClose}>
      <div>
        <h2>{vaga.titulo}</h2>
        <img src={vaga.organizacao.logo || "/default-org.png"} alt="Logo" />
        <span>{vaga.organizacao.nome}</span>
        <div>{vaga.descricao}</div>
        <div>Requisitos: {vaga.requisitos}</div>
        <div>Benefícios: {vaga.beneficios}</div>
        <div>Posições: {vaga.posicoes?.join(", ")}</div>
        <div>Tipos: {vaga.tiposUsuario?.join(", ")}</div>
        <div>Elo: {vaga.elos?.join(", ")}</div>
        {vaga.cidade && <div>Localização: {vaga.cidade}/{vaga.estado}</div>}
        <div>Tags: {vaga.tags?.join(", ")}</div>
        <div>Status: {vaga.status}</div>
        <div>Publicado em: {new Date(vaga.dataPublicacao).toLocaleDateString()}</div>
        {!isOrg && (
          <Button disabled={jaCandidatado} onClick={() => onCandidatar(vaga.id)}>
            {jaCandidatado ? "Candidatado" : "Candidatar-se"}
          </Button>
        )}
        {isOrg && (
          <>
            <Button onClick={() => onFechar(vaga.id)}>
              {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
            </Button>
            <Button onClick={() => onDeletar(vaga.id)}>Deletar</Button>
            <Link href={`/vagas/editar/${vaga.id}`}><Button>Editar vaga</Button></Link>
            <div>
              <h3>Candidatos:</h3>
              {vaga.candidatos?.map(c => (
                <div key={c.usuarioId}>{c.usuario.nome} ({c.usuario.tipo})</div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}