import Link from "next/link";
import { Button } from "./ui/button";

export default function VagaCard({ vaga, usuario, onCandidatar, onSalvar, onFechar, onDeletar }) {
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id);
  const jaFavoritou = vaga.favoritos?.some(f => f.usuarioId === usuario?.id);
  const isOrg = usuario?.tipo === "organizacao" && usuario?.id === vaga.organizacaoId;

  const statusClasse = vaga.status === "Aberta" ? "badge-verde" : "badge-cinza";

  return (
    <div className="card">
      <img
        src={vaga.organizacao && vaga.organizacao.logo ? vaga.organizacao.logo : "/default-org.png"}
        alt="Logo"
        className="logo"
      />
      <div>
        <h2>
          {vaga.titulo}{" "}
          <span className={statusClasse} style={{
            backgroundColor: vaga.status === "Aberta" ? "#32CD32" : "#ccc",
            color: vaga.status === "Aberta" ? "#fff" : "#333",
            padding: "2px 8px",
            borderRadius: "10px",
            fontSize: "0.8em",
            marginLeft: "8px"
          }}>
            {vaga.status}
          </span>
        </h2>
        <p>{vaga.descricao}</p>
        <div>
          <span>Posições: {vaga.posicoes?.join(", ")}</span>
          <span>Elo: {vaga.elos?.join(", ")}</span>
          <span>Tipos: {vaga.tiposUsuario?.join(", ")}</span>
          {vaga.tags?.length > 0 && <span>Tags: {vaga.tags.join(", ")}</span>}
          {vaga.cidade && <span>{vaga.cidade}/{vaga.estado}</span>}
        </div>
        <div>
          <Link href={`/vagas/${vaga.id}`}><Button>Ver detalhes</Button></Link>
          {!isOrg && (
            <Button disabled={jaCandidatado} onClick={() => onCandidatar(vaga.id)}>
              {jaCandidatado ? "Candidatado" : "Candidatar-se"}
            </Button>
          )}
          <Button onClick={() => onSalvar(vaga.id)}>{jaFavoritou ? "Salvo" : "Salvar"}</Button>
          {isOrg && (
            <>
              <Button onClick={() => onFechar(vaga.id)}>
                {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
              </Button>
              <Button onClick={() => onDeletar(vaga.id)}>Deletar</Button>
              <Link href={`/vagas/editar/${vaga.id}`}><Button>Editar vaga</Button></Link>
            </>
          )}
        </div>
        <span>Candidatos: {vaga.candidatos?.length || 0}</span>
      </div>
    </div>
  );
}