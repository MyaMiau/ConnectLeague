import Link from "next/link";
import { X, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function VagaDetalhesModal({
  vaga,
  usuario,
  onClose,
  onCandidatar,
  onDescandidatar,
  onSalvar,
  onRemoverSalvo,
  onFechar,
  onEditar,
  onDeletar,
}) {
  if (!vaga) return null;

  const isOrg = usuario?.type === "organization";
  const isOrgDona = isOrg && usuario?.id === vaga.organization?.id;

  const jaCandidatado = vaga.applications?.some(
    (app) => Number(app.user_id) === Number(usuario?.id),
  );
  const jaFavoritou = vaga.favorites?.some(
    (f) => Number(f.userId) === Number(usuario?.id),
  );

  const org = vaga.organization || {};
  const orgName = org.name || "Organização desconhecida";

  const podeCandidatar = vaga.status === "Aberta" && !isOrg;

  const statusClass = cn(
    "badge-status",
    vaga.status === "Aberta" ? "badge-open" : "badge-closed",
  );

  const dataPublicacao =
    vaga.dataPublicacao || vaga.created_at
      ? new Date(vaga.dataPublicacao || vaga.created_at).toLocaleDateString()
      : "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative card-glow bg-card rounded-2xl w-full max-w-2xl p-6 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="space-y-5">
          {/* Título e organização */}
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {vaga.titulo || vaga.title}
            </h2>
            <p className="text-muted-foreground">{orgName}</p>
          </div>

          {/* Organização / logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
              <img
                src={
                  org.logo || org.logoUrl || org.image || "/default-avatar.png"
                }
                alt={orgName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {org.id && (
              <Link href={`/profile/${org.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="btn-secondary-custom px-4 py-2 rounded-lg text-sm"
                >
                  Perfil da organização
                </Button>
              </Link>
            )}
          </div>

          {/* Status & data */}
          <div className="flex items-center gap-3">
            <span className={statusClass}>
              {vaga.status === "Aberta" ? "Aberta" : "Fechada"}
            </span>
            <span className="text-sm text-muted-foreground">
              Publicada em {dataPublicacao}
            </span>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Descrição completa
            </h3>
            <p className="text-muted-foreground">
              {vaga.descricaoCompleta || vaga.descricao || vaga.description}
            </p>
          </div>

          {/* Requisitos / benefícios */}
          {vaga.requisitos && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Requisitos</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                {Array.isArray(vaga.requisitos)
                  ? vaga.requisitos.map((r, i) => <li key={i}>{r}</li>)
                  : <li>{vaga.requisitos}</li>}
              </ul>
            </div>
          )}

          {vaga.beneficios && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Benefícios</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                {Array.isArray(vaga.beneficios)
                  ? vaga.beneficios.map((b, i) => <li key={i}>{b}</li>)
                  : <li>{vaga.beneficios}</li>}
              </ul>
            </div>
          )}

          {/* Detalhes adicionais */}
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-foreground">
                Posições:
              </span>{" "}
              <span className="text-muted-foreground">
                {vaga.posicoes?.join(", ") ||
                  vaga.positions?.join(", ") ||
                  "—"}
              </span>
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Elo mínimo:
              </span>{" "}
              <span className="text-muted-foreground">
                {vaga.elos?.join(", ") || "—"}
              </span>
            </p>
            {(vaga.cidade || vaga.city || vaga.estado || vaga.state) && (
              <p>
                <span className="font-semibold text-foreground">
                  Localização:
                </span>{" "}
                <span className="text-muted-foreground">
                  {vaga.cidade || vaga.city || ""}
                  {(vaga.cidade || vaga.city) &&
                  (vaga.estado || vaga.state)
                    ? "/"
                    : ""}
                  {vaga.estado || vaga.state || ""}
                </span>
              </p>
            )}
            {vaga.tags?.length > 0 && (
              <p>
                <span className="font-semibold text-foreground">Tags:</span>{" "}
                <span className="text-muted-foreground">
                  {vaga.tags.join(", ")}
                </span>
              </p>
            )}
          </div>

          {/* Candidatos */}
          <div className="flex items-center gap-3">
            <span className="text-foreground">
              Candidatos:{" "}
              <span className="font-semibold">
                {vaga.applications?.length || 0}
              </span>
            </span>
            {isOrgDona && (
              <Link href={`/vagas/candidatos?id=${vaga.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="btn-secondary-custom px-4 py-2 rounded-lg text-sm"
                >
                  Ver candidatos
                </Button>
              </Link>
            )}
          </div>

          {/* Ações principais */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Jogador se candidata / descandidata */}
            {podeCandidatar && (
              <Button
                size="sm"
                className="btn-gradient px-6 py-2.5 rounded-lg text-sm"
                disabled={!podeCandidatar}
                onClick={() =>
                  jaCandidatado
                    ? onDescandidatar?.(vaga.id)
                    : onCandidatar?.(vaga.id)
                }
                aria-label={
                  jaCandidatado ? "Cancelar candidatura" : "Candidatar-se"
                }
              >
                {jaCandidatado ? "Cancelar candidatura" : "Candidatar-se"}
              </Button>
            )}

            {/* Gestão da vaga pela organização dona */}
            {isOrgDona && (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="bg-success hover:bg-success/80 text-success-foreground px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  onClick={() => onFechar?.(vaga.id)}
                >
                  {vaga.status === "Aberta" ? "Fechar vaga" : "Reabrir vaga"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  onClick={() => onEditar?.(vaga)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-destructive hover:bg-destructive/80 text-destructive-foreground px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  onClick={() => onDeletar?.(vaga.id)}
                >
                  Deletar
                </Button>
              </>
            )}

            {/* Favoritar / desfavoritar (apenas para perfis que não são organização) */}
            {!isOrg && (
              <button
                type="button"
                aria-label={jaFavoritou ? "Remover dos salvos" : "Salvar vaga"}
                onClick={() =>
                  jaFavoritou
                    ? onRemoverSalvo?.(vaga.id)
                    : onSalvar?.(vaga.id)
                }
                className={cn(
                  "p-2.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center",
                  jaFavoritou ? "text-primary" : "text-muted-foreground",
                )}
              >
                {jaFavoritou ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}