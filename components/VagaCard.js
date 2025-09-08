import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "./ui/button";

export default function VagaCard({
  vaga,
  usuario,
  onCandidatar,
  onSalvar,
  onRemoverSalvo,
  onFechar,
  onDeletar,
  onVerDetalhes
}) {
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id);
  const jaFavoritou = vaga.favorites?.some(f => f.userId === usuario?.id);
  const isOrg = usuario?.tipo === "organizacao" && usuario?.id === vaga.organizacaoId;
  const badgeClasse = vaga.status === "Aberta"
    ? "bg-green-600 text-white"
    : "bg-purple-700 text-white";

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
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badgeClasse}`}
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
      <div className="flex flex-wrap gap-2 mt-1 items-center">
        <Button variant="default" onClick={() => onVerDetalhes?.(vaga)}>
          Ver detalhes
        </Button>
        {!isOrg && (
          <Button
            variant="default"
            disabled={jaCandidatado}
            onClick={() => onCandidatar?.(vaga.id)}
            aria-label={jaCandidatado ? "Já candidatado" : "Candidatar-se"}
          >
            {jaCandidatado ? "Candidatado" : "Candidatar-se"}
          </Button>
        )}
        <span
          role="button"
          aria-label={jaFavoritou ? "Remover dos salvos" : "Salvar vaga"}
          tabIndex={0}
          onClick={() => jaFavoritou ? onRemoverSalvo?.(vaga.id) : onSalvar?.(vaga.id)}
          onKeyPress={e => {
            if (e.key === 'Enter') jaFavoritou ? onRemoverSalvo?.(vaga.id) : onSalvar?.(vaga.id);
          }}
          className={`ml-2 cursor-pointer transition ${jaFavoritou ? "text-purple-500" : "text-zinc-400"} hover:text-purple-600`}
          style={{ display: 'flex', alignItems: 'center', fontSize: '1.75rem' }}
        >
          {jaFavoritou ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
        </span>
        {isOrg && (
          <>
            <Button variant="secondary" onClick={() => onFechar?.(vaga.id)}>
              {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
            </Button>
            <Button variant="destructive" onClick={() => onDeletar?.(vaga.id)}>
              Deletar vaga
            </Button>
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