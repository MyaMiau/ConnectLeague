import { Button } from "./ui/button";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function VagaModal({
  vaga,
  usuario,
  onCandidatar,
  onFechar,
  onDeletar,
  onSalvar,
  onRemoverSalvo,
  onClose
}) {
  if (!vaga) return null;
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id);
  const jaFavoritou = vaga.favorites?.some(f => f.userId === usuario?.id);
  const isOrg = usuario?.tipo === "organizacao" && usuario?.id === vaga.organizacaoId;

  return (
    <Modal open={!!vaga} onClose={onClose}>
      <div>
        <h2>{vaga.titulo}</h2>
        <img src={vaga.organizacao.logo || "/default-org.png"} alt="Logo" />
        <span>{vaga.organizacao.nome}</span>
        <div>{vaga.descricao}</div>
        <div><strong>Requisitos:</strong> {vaga.requisitos}</div>
        <div><strong>Benefícios:</strong> {vaga.beneficios}</div>
        <div><strong>Posições:</strong> {vaga.posicoes?.join(", ")}</div>
        <div><strong>Tipos de usuário:</strong> {vaga.tiposUsuario?.join(", ")}</div>
        <div><strong>Elo:</strong> {vaga.elos?.join(", ")}</div>
        {vaga.cidade && <div><strong>Localização:</strong> {vaga.cidade}/{vaga.estado}</div>}
        <div><strong>Tags:</strong> {vaga.tags?.join(", ")}</div>
        <div><strong>Status:</strong> {vaga.status}</div>
        <div><strong>Publicado em:</strong> {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : "?"}</div>
        <div style={{ margin: "12px 0" }}>
          <Link href={`/organizacao/${vaga.organizacaoId}`}>
            <Button variant="outline">Ver perfil da organização</Button>
          </Link>
        </div>
        {!isOrg && (
          <>
            <Button disabled={jaCandidatado} onClick={() => onCandidatar(vaga.id)}>
              {jaCandidatado ? "Candidatado" : "Candidatar-se"}
            </Button>
            <span
              role="button"
              aria-label={jaFavoritou ? "Remover dos salvos" : "Salvar vaga"}
              tabIndex={0}
              onClick={() => jaFavoritou ? onRemoverSalvo?.(vaga.id) : onSalvar?.(vaga.id)}
              onKeyPress={e => {
                if (e.key === 'Enter') jaFavoritou ? onRemoverSalvo?.(vaga.id) : onSalvar?.(vaga.id);
              }}
              className={`ml-3 cursor-pointer transition ${jaFavoritou ? "text-purple-500" : "text-zinc-400"} hover:text-purple-600`}
              style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.75rem', marginLeft: 8 }}
            >
              {jaFavoritou ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
            </span>
          </>
        )}
        {isOrg && (
          <>
            <Button onClick={() => onFechar(vaga.id)}>
              {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
            </Button>
            <Button variant="destructive" onClick={() => onDeletar(vaga.id)}>Deletar</Button>
            <Link href={`/vagas/editar/${vaga.id}`}><Button>Editar vaga</Button></Link>
            <div style={{ marginTop: "16px" }}>
              <h3>Candidatos:</h3>
              {vaga.candidatos?.length > 0 ? (
                vaga.candidatos.map(c => (
                  <div key={c.usuarioId}>{c.usuario.nome} ({c.usuario.tipo})</div>
                ))
              ) : (
                <div>Nenhum candidato ainda.</div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}