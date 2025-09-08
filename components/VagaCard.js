import Link from "next/link";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function VagaCard({
  vaga,
  usuario,
  onCandidatar,
  onSalvar,
  onRemoverSalvo,
  onFechar,
  onDeletar,
  onShowDetails,
}) {
  const jaFavoritou = vaga.favoritos?.some(f => f.usuarioId === usuario?.id);
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id);
  const isOrg = usuario?.tipo === "organizacao" && usuario?.id === vaga.organizacaoId;

  const statusClasse = vaga.status === "Aberta"
    ? "bg-green-600 text-white"
    : "bg-gray-400 text-gray-800";

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg p-6 flex flex-col gap-3 border border-zinc-800">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={vaga.organizacao?.logo || "/default-org.png"}
          alt="Logo"
          className="w-20 h-20 rounded-full bg-zinc-800 object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {vaga.titulo || "Vaga sem título"}
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusClasse}`}
              style={{ marginLeft: 8 }}
            >
              {vaga.status || "Aberta"}
            </span>
          </h2>
          <p className="text-zinc-300 text-sm">{vaga.descricao}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-zinc-200 mb-2">
        <span><strong>Posições:</strong> {vaga.posicoes?.join(", ") || "Não informado"}</span>
        <span><strong>Elo:</strong> {vaga.elos?.join(", ") || "Não informado"}</span>
        <span><strong>Tipos:</strong> {vaga.tiposUsuario?.join(", ") || "Não informado"}</span>
        {vaga.tags?.length > 0 && <span><strong>Tags:</strong> {vaga.tags.join(", ")}</span>}
        {vaga.cidade && <span><strong>Localização:</strong> {vaga.cidade}/{vaga.estado}</span>}
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        <Button variant="default" onClick={() => onShowDetails?.(vaga)}>
          Ver detalhes
        </Button>
        {!isOrg && (
          <Button
            variant="default"
            disabled={jaCandidatado}
            onClick={() => onCandidatar?.(vaga.id)}
          >
            {jaCandidatado ? "Candidatado" : "Candidatar-se"}
          </Button>
        )}
        <Button
          variant={jaFavoritou ? "secondary" : "default"}
          onClick={() =>
            jaFavoritou
              ? onRemoverSalvo?.(vaga.id)
              : onSalvar?.(vaga.id)
          }
          aria-label={jaFavoritou ? "Remover dos salvos" : "Salvar vaga"}
          className="!border-none !shadow-none"
        >
          {jaFavoritou ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </Button>
        {isOrg && (
          <>
            <Button variant="secondary" onClick={() => onFechar?.(vaga.id)}>
              {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
            </Button>
            <Button variant="destructive" onClick={() => onDeletar?.(vaga.id)}>
              Deletar vaga
            </Button>
            <Link href={`/vagas/editar/${vaga.id}`}>
              <Button variant="outline">Editar vaga</Button>
            </Link>
          </>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 text-sm text-zinc-400">
        <span>Publicada: {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : "?"}</span>
        <span>Candidatos: {vaga.candidatos?.length || 0}</span>
      </div>
    </div>
  );
}