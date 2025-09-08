import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";

export default function VagaDetalhesModal({ vaga, usuario, onClose, onCandidatar, onSalvar, onRemoverSalvo }) {
  if (!vaga) return null;
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id);
  const jaFavoritou = vaga.favoritos?.some(f => f.usuarioId === usuario?.id);

  const badgeClasse = vaga.status === "Aberta"
    ? "bg-green-600 text-white"
    : "bg-purple-700 text-white";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-xl p-8 max-w-2xl w-full shadow-2xl relative">
        <button
          className="absolute top-3 right-3 text-white text-xl"
          onClick={onClose}
        >×</button>
        <h2 className="text-2xl font-bold mb-4">{vaga.titulo}</h2>
        <div className="flex gap-6 items-center mb-4">
          <img src={vaga.organizacao?.logo || "/default-org.png"} alt="Logo" className="w-16 h-16 rounded-full bg-zinc-800 border mb-2" />
          <div>
            <p className="font-semibold">{vaga.organizacao?.nome}</p>
            <Link href={`/profile/${vaga.organizacao?.id}`}>
              <Button variant="outline">Perfil da organização</Button>
            </Link>
          </div>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full font-semibold mb-2 ${badgeClasse}`}>{vaga.status}</span>
        <span className="ml-3 text-zinc-400">Publicada em {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : "?"}</span>
        <div className="my-4">
          <h3 className="font-bold mb-2">Descrição completa</h3>
          <p className="text-zinc-200">{vaga.descricaoCompleta || vaga.descricao}</p>
        </div>
        <div className="mb-3">
          <h3 className="font-bold mb-2">Requisitos</h3>
          <ul className="list-disc pl-6 text-zinc-200">
            {vaga.requisitos?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div className="mb-3">
          <h3 className="font-bold mb-2">Benefícios</h3>
          <ul className="list-disc pl-6 text-zinc-200">
            {vaga.beneficios?.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div className="mb-3">
          <span className="text-zinc-400"><strong>Posições:</strong> {vaga.posicoes?.join(", ")}</span> <br />
          <span className="text-zinc-400"><strong>Elo mínimo:</strong> {vaga.elos?.join(", ")}</span> <br />
          <span className="text-zinc-400"><strong>Localização:</strong> {vaga.cidade}/{vaga.estado}</span> <br />
          {vaga.tags?.length > 0 && <span className="text-zinc-400"><strong>Tags:</strong> {vaga.tags.join(", ")}</span>}
        </div>
        <div className="mb-6">
          <span className="text-zinc-400"><strong>Candidatos:</strong> {vaga.candidatos?.length || 0}</span>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="default"
            disabled={jaCandidatado}
            onClick={() => onCandidatar?.(vaga.id)}
            aria-label={jaCandidatado ? "Já candidatado" : "Candidatar-se"}
          >
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
            style={{ display: 'flex', alignItems: 'center', fontSize: '2rem' }}
          >
            {jaFavoritou ? <BookmarkCheck size={28} /> : <Bookmark size={28} />}
          </span>
        </div>
      </div>
    </div>
  );
}