import Link from "next/link";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function VagaCard({
  vaga,
  usuario,
  onCandidatar,
  onDescandidatar,
  onSalvar,
  onRemoverSalvo,
  onFechar,
  onDeletar,
  onShowDetails,
}) {

  const tipoUsuario = usuario?.type || usuario?.tipo;
  const idUsuario = usuario?.id;

  const jaFavoritou = vaga.favorites?.some(f => Number(f.userId) === Number(idUsuario));
  const jaCandidatado = vaga.applications?.some(app => Number(app.user_id) === Number(idUsuario));
  const isOrg = tipoUsuario === "organization" && idUsuario === vaga.organization_id;

  const statusClasse = vaga.status === "Aberta"
    ? "bg-green-600 text-white"
    : "bg-red-600 text-white";

  const podeCandidatar = vaga.status === "Aberta" && tipoUsuario === "player";

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg p-6 flex flex-col gap-3 border border-zinc-800">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={
            vaga.organization?.logo ||
            vaga.organization?.image ||
            "/default-avatar.png"}
          alt="Logo"
          className="w-20 h-20 rounded-full bg-zinc-800 object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {vaga.titulo || vaga.title || "Vaga sem título"}
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusClasse}`}
              style={{ marginLeft: 8 }}
            >
              {vaga.status === "Aberta" ? "Aberta" : "Fechada"}
            </span>
          </h2>
          <span className="block text-zinc-400 font-semibold text-lg mb-1">
            {vaga.organization?.name || "Organização desconhecida"}
          </span>
          <p className="text-zinc-300 text-sm">{vaga.descricao || vaga.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-zinc-200 mb-2">
        <span><strong>Posições:</strong> {vaga.posicoes?.join(", ") || vaga.positions?.join(", ") || "Não informado"}</span>
        <span><strong>Elo:</strong> {vaga.elos?.join(", ") || "Não informado"}</span>
        <span><strong>Tipos:</strong> {vaga.tiposUsuario?.join(", ") || vaga.userTypes?.join(", ") || "Não informado"}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        <Button variant="default" onClick={() => onShowDetails?.(vaga)}>
          Ver detalhes
        </Button>
        {/* Apenas jogadores podem se candidatar/descandidatar, e apenas se vaga está aberta */}
        {podeCandidatar && (
          <Button
            color={jaCandidatado ? "red" : "green"}
            disabled={!podeCandidatar}
            onClick={() =>
              jaCandidatado ? onDescandidatar?.(vaga.id) : onCandidatar?.(vaga.id)}>
            {jaCandidatado ? "Cancelar candidatura" : "Candidatar-se"}
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
        {/* Apenas organização dona pode editar/fechar/deletar */}
        {isOrg && (
          <>
            <Button variant="secondary" onClick={() => onFechar?.(vaga.id)}>
              {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
            </Button>
            <Button color="red" onClick={() => onDeletar?.(vaga.id)}>
              Deletar vaga
            </Button>
            <Link href={`/vagas/editar/${vaga.id}`}>
              <Button variant="outline">Editar vaga</Button>
            </Link>
          </>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 text-sm text-zinc-400">
        <span>Publicada: {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}</span>
        <span>Candidatos: {vaga.applications?.length || 0}</span>
      </div>
    </div>
  );
}