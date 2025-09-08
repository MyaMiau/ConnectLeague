import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";

export default function VagaDetalhesModal({
  vaga,
  usuario,
  onClose,
  onCandidatar,
  onSalvar,
  onRemoverSalvo
}) {
  if (!vaga) return null;
  const jaCandidatado = vaga.candidatos?.some(c => c.usuarioId === usuario?.id) || vaga.applications?.some(c => c.user_id === usuario?.id);
  // Atualizado: sempre usa favorites e userId
  const jaFavoritou = vaga.favorites?.some(f => f.userId === usuario?.id);

  const org = vaga.organizacao || vaga.organization || {};
  const orgName = org.nome || org.name || "Organização desconhecida";
  const orgLogo = org.logo || org.logoUrl || "/default-org.png";
  const orgId = org.id;

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
        <h2 className="text-2xl font-bold mb-4">{vaga.titulo || vaga.title || "Vaga sem título"}</h2>
        <div className="flex gap-6 items-center mb-4">
          <img
            src={orgLogo}
            alt="Logo"
            className="w-16 h-16 rounded-full bg-zinc-800 border mb-2"
          />
          <div>
            <p className="font-semibold">{orgName}</p>
            <Link href={`/profile/${orgId || ""}`}>
              <Button variant="outline">Perfil da organização</Button>
            </Link>
          </div>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full font-semibold mb-2 ${badgeClasse}`}>
          {vaga.status || "Status desconhecido"}
        </span>
        <span className="ml-3 text-zinc-400">
          Publicada em {vaga.dataPublicacao ? new Date(vaga.dataPublicacao).toLocaleDateString() : vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}
        </span>
        <div className="my-4">
          <h3 className="font-bold mb-2">Descrição completa</h3>
          <p className="text-zinc-200 whitespace-pre-line">
            {vaga.descricaoCompleta || vaga.descricao || vaga.description || "Sem descrição."}
          </p>
        </div>
        {vaga.requisitos && (
          <div className="mb-3">
            <h3 className="font-bold mb-2">Requisitos</h3>
            <ul className="list-disc pl-6 text-zinc-200">
              {Array.isArray(vaga.requisitos)
                ? vaga.requisitos.map((r, i) => <li key={i}>{r}</li>)
                : <li>{vaga.requisitos}</li>
              }
            </ul>
          </div>
        )}
        {vaga.beneficios && (
          <div className="mb-3">
            <h3 className="font-bold mb-2">Benefícios</h3>
            <ul className="list-disc pl-6 text-zinc-200">
              {Array.isArray(vaga.beneficios)
                ? vaga.beneficios.map((b, i) => <li key={i}>{b}</li>)
                : <li>{vaga.beneficios}</li>
              }
            </ul>
          </div>
        )}
        <div className="mb-3">
          <span className="text-zinc-400">
            <strong>Posições:</strong> {vaga.posicoes?.join(", ") || vaga.positions?.join(", ") || "—"}
          </span>
          <br />
          <span className="text-zinc-400">
            <strong>Elo mínimo:</strong> {vaga.elos?.join(", ") || "—"}
          </span>
          <br />
          {(vaga.cidade || vaga.city || vaga.estado || vaga.state) && (
            <span className="text-zinc-400">
              <strong>Localização:</strong> {vaga.cidade || vaga.city || ""}{(vaga.cidade || vaga.city) && (vaga.estado || vaga.state) ? "/" : ""}{vaga.estado || vaga.state || ""}
            </span>
          )}
          <br />
          {vaga.tags?.length > 0 && (
            <span className="text-zinc-400">
              <strong>Tags:</strong> {vaga.tags.join(", ")}
            </span>
          )}
        </div>
        <div className="mb-6">
          <span className="text-zinc-400">
            <strong>Candidatos:</strong> {vaga.candidatos?.length || vaga.applications?.length || 0}
          </span>
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
            {/* Mantém o check SEMPRE que o user já salvou, e só volta se realmente não estiver salvo */}
            {jaFavoritou ? <BookmarkCheck size={28} /> : <Bookmark size={28} />}
          </span>
        </div>
      </div>
    </div>
  );
}