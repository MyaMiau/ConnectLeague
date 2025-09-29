import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { FiMoreHorizontal, FiHeart, FiMessageCircle, FiShare2 } from "react-icons/fi";
import CommentsList from "../../components/CommentsList";
import CommentForm from "../../components/CommentForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrganizationProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [org, setOrg] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [localOrg, setLocalOrg] = useState(null);

  // States for modal/forms
  const [showVagaModal, setShowVagaModal] = useState(false);
  const [vagaData, setVagaData] = useState({ titulo: "", descricao: "" });
  const [showPostModal, setShowPostModal] = useState(false);
  const [postData, setPostData] = useState({ content: "", image: null });
  const [postImagePreview, setPostImagePreview] = useState("");
  const [postError, setPostError] = useState("");
  const postImageInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organization/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrg(data.organization);
        setLocalOrg(data.organization);
        setLoading(false);
      });
    // Apenas vagas da organização
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.vagas || []).filter(vaga =>
          vaga.organizationId == id || vaga.organization?.id == id
        );
        setVagas(filtered);
      });
    // Buscar posts usando userId
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setLocalOrg(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    const res = await fetch(`/api/organization/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localOrg),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrg(updated.organization);
      setLocalOrg(updated.organization);
      setEditMode(false);
      setShowMenu(false);
      alert("Perfil salvo com sucesso!");
    } else {
      alert("Erro ao salvar perfil.");
    }
  }

  function handleMenuClick() {
    setShowMenu(!showMenu);
  }

  // Abrir vaga
  function handleOpenVagaModal() {
    setVagaData({ titulo: "", descricao: "" });
    setShowVagaModal(true);
  }
  async function handleSubmitVaga(e) {
    e.preventDefault();
    const res = await fetch("/api/vagas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...vagaData,
        organizationId: id,
      }),
    });
    if (res.ok) {
      setShowVagaModal(false);
      // Atualiza lista
      fetch(`/api/vagas?organizationId=${id}`)
        .then(res => res.json())
        .then(data => {
          const filtered = (data.vagas || []).filter(vaga =>
            vaga.organizationId == id || vaga.organization?.id == id
          );
          setVagas(filtered);
        });
    } else {
      alert("Erro ao criar vaga.");
    }
  }

  // Fazer post
  function handleOpenPostModal() {
    setPostData({ content: "", image: null });
    setPostImagePreview("");
    setPostError("");
    setShowPostModal(true);
  }
  function handlePostImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPostImagePreview(URL.createObjectURL(file));
    setPostData(pd => ({ ...pd, image: file }));
  }

  // Upload da imagem (igual CreatePost.jsx)
  async function uploadImageIfNeeded(imageFile) {
    if (!imageFile) return "";
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      const resp = await fetch("/api/posts/upload", {
        method: "POST",
        body: formData,
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.imageUrl || "";
      } else {
        setPostError("Erro ao enviar imagem. Tente novamente.");
        return "";
      }
    } catch (err) {
      setPostError("Erro ao enviar imagem. Tente novamente.");
      return "";
    }
  }

  async function handleSubmitPost(e) {
    e.preventDefault();
    setPostError("");

    // 1. Upload da imagem (se houver)
    let imageUrl = "";
    if (postData.image) {
      imageUrl = await uploadImageIfNeeded(postData.image);
      if (!imageUrl) {
        return; // erro já tratado
      }
    }

    // 2. Monta o payload no formato correto
    const payload = {
      content: postData.content,
      image: imageUrl,
      authorId: id // id da organização, igual ao da rota!
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowPostModal(false);
      setPostData({ content: "", image: null });
      setPostImagePreview("");
      fetch(`/api/posts?userId=${id}`)
        .then(res => res.json())
        .then(data => setPosts(data || []));
    } else {
      setPostError("Erro ao criar post.");
    }
  }

  // ----------- POST ACTIONS (CURTIR, COMPARTILHAR, 3 PONTINHOS, ETC) -----------

  // Menu de 3 pontinhos por post
  const handleShowPostMenu = (postId) => setShowPostMenu(showPostMenu === postId ? null : postId);

  // Editar post
  const handleEditPost = (post) => {
    setShowPostModal(true);
    setPostData({ content: post.content, image: null });
    setPostImagePreview(post.image || "");
  };

  // Deletar post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Tem certeza que deseja excluir este post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  };

  // Curtir/descurtir post
  const handleLikePost = async (postId) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  };

  // Compartilhar post
  const handleSharePost = (post) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      alert("Link do post copiado!");
    }
  };

  // ----------- FIM DAS FUNÇÕES DE POST -----------

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </div>
    );
  if (!org)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Organização não encontrada.
      </div>
    );

  const displayName = localOrg?.orgName || localOrg?.name;
  const displayBio = localOrg?.orgDesc || localOrg?.bio || "Nenhuma descrição ainda.";
  const displayImage = localOrg?.logo || localOrg?.image || "/default-avatar.png";
  const displayEmail = localOrg?.email || "";

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Header user={org} />
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        {/* Card de perfil da organização */}
        <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-xl mb-8 border border-zinc-800 relative">
          <div className="flex gap-6 items-center px-8 py-8">
            <div className="shrink-0">
              <Image
                src={displayImage}
                width={120}
                height={120}
                className="rounded-full border-4 border-purple-500 object-cover bg-zinc-800"
                alt={`Logo da organização ${displayName}`}
              />
            </div>
            <div className="flex-1 flex flex-col items-start">
              <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
              {displayEmail && <p className="text-zinc-400 mb-2">{displayEmail}</p>}
              <p className="text-zinc-300 mb-2">{displayBio}</p>
            </div>
            {org.isCurrentUser && !editMode && (
              <div className="absolute top-6 right-6 z-10">
                <button
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
                  onClick={handleMenuClick}
                  aria-label="Opções"
                >
                  <FiMoreHorizontal size={28} color="#A78BFA" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-zinc-900 shadow rounded py-1 px-2">
                    <button
                      className="text-zinc-200 hover:text-purple-400 px-3 py-1 w-full text-left"
                      onClick={() => {
                        setEditMode(true);
                        setShowMenu(false);
                      }}
                    >
                      Editar Perfil
                    </button>
                  </div>
                )}
              </div>
            )}
            {org.isCurrentUser && editMode && (
              <div className="absolute top-6 right-6 z-10 flex gap-2">
                <Button size="sm" onClick={handleSave}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setShowMenu(false); }}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
          {org.isCurrentUser && editMode && (
            <div className="px-8 pb-8">
              <Input
                name="orgName"
                value={localOrg.orgName || ""}
                onChange={handleChange}
                className="text-lg font-bold mt-2 mb-2"
                placeholder="Nome da Organização"
              />
              <Input
                name="email"
                value={localOrg.email || ""}
                onChange={handleChange}
                className="mb-2"
                placeholder="Email"
              />
              <Textarea
                name="orgDesc"
                value={localOrg.orgDesc || ""}
                onChange={handleChange}
                className="mb-2"
                placeholder="Descrição/Bio"
              />
            </div>
          )}
        </div>

        {org.isCurrentUser && (
          <div className="w-full max-w-2xl flex gap-4 mb-8">
            <Button className="flex-1" onClick={handleOpenVagaModal}>
              Abrir uma vaga
            </Button>
            <Button className="flex-1" variant="outline" onClick={handleOpenPostModal}>
              Fazer um post
            </Button>
          </div>
        )}

        {showVagaModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
            <form
              className="bg-zinc-900 p-8 rounded-2xl shadow-lg max-w-md w-full flex flex-col gap-3"
              onSubmit={handleSubmitVaga}
            >
              <h2 className="text-xl font-bold mb-2">Abrir vaga</h2>
              <Input
                name="titulo"
                placeholder="Título da vaga"
                value={vagaData.titulo}
                onChange={e => setVagaData(v => ({ ...v, titulo: e.target.value }))}
                required
              />
              <Textarea
                name="descricao"
                placeholder="Descrição da vaga"
                value={vagaData.descricao}
                onChange={e => setVagaData(v => ({ ...v, descricao: e.target.value }))}
                required
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit">Criar</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowVagaModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL DE POST */}
        {showPostModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
            <form
              className="bg-zinc-900 p-8 rounded-2xl shadow-lg max-w-md w-full flex flex-col gap-3"
              onSubmit={handleSubmitPost}
            >
              <h2 className="text-xl font-bold mb-2">Novo post</h2>
              <Textarea
                name="content"
                placeholder="Digite seu post"
                value={postData.content}
                onChange={e => setPostData(p => ({ ...p, content: e.target.value }))}
                required
              />
              <label className="font-semibold text-zinc-300 mt-2 mb-1">Imagem (opcional)</label>
              <input
                type="file"
                accept="image/*"
                ref={postImageInputRef}
                onChange={handlePostImageChange}
                className="bg-zinc-800 text-zinc-200 rounded p-2"
              />
              {postImagePreview && (
                <div className="mt-2">
                  <Image
                    src={postImagePreview}
                    width={400}
                    height={200}
                    className="rounded-lg"
                    alt="Prévia da imagem"
                  />
                </div>
              )}
              {postError && <div className="text-red-500 text-sm">{postError}</div>}
              <div className="flex gap-2 mt-2">
                <Button type="submit">Publicar</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowPostModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Vagas abertas */}
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Vagas abertas</h2>
          {vagas.length === 0 ? (
            <p className="text-zinc-500 text-center">Nenhuma vaga aberta.</p>
          ) : (
            <div className="space-y-4">
              {vagas.map(vaga => (
                <div key={vaga.id} className="bg-zinc-900 rounded-xl p-5 shadow">
                  <h3 className="text-lg font-bold">{vaga.titulo || vaga.title}</h3>
                  <p className="text-zinc-300 mb-2">{vaga.descricao || vaga.description}</p>
                  <span className="text-xs text-zinc-400">
                    Publicada em {vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}
                  </span>
                  <div className="mt-2">
                    <Button size="sm" onClick={() => router.push(`/vagas/${vaga.id}`)}>
                      Ver vaga
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POSTS DA ORGANIZAÇÃO - IGUAL AO PROFILE DO PLAYER */}
        <div className="w-full max-w-2xl space-y-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Posts</h2>
          {posts.length === 0 && (
            <p className="text-center text-zinc-400">Nenhum post encontrado para esta organização.</p>
          )}
          {posts.map((post) => {
            const isAuthor = org?.id === post.authorId;
            const hasLiked = post.postLikes?.some(like => like.userId === org?.id);
            return (
              <Card key={post.id} className="bg-zinc-900 rounded-2xl">
                <CardContent className="p-6 space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${post.author?.id || ""}`} className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                          <Image
                            src={post.author?.image || "/default-avatar.png"}
                            alt="Avatar"
                            fill
                            sizes="40px"
                            className="object-cover"
                            priority
                          />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:underline">
                            {post.author?.name || "Autor desconhecido"}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {post.createdAt ?
                              format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR }) :
                              ""}
                          </p>
                        </div>
                      </Link>
                    </div>
                    <div className="relative">
                      {isAuthor && (
                        <>
                          <button type="button" onClick={() => setShowPostMenu(post.id === showPostMenu ? null : post.id)}>
                            <FiMoreHorizontal className="text-zinc-400 hover:text-white cursor-pointer" />
                          </button>
                          {showPostMenu === post.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded shadow-md z-10 cursor-pointer">
                              <button type="button" onClick={() => handleEditPost(post)} className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer">
                                Editar
                              </button>
                              <button type="button" onClick={() => handleDeletePost(post.id)} className="block w-full text-left px-4 py-2 hover:bg-zinc-700 text-red-500 cursor-pointer">
                                Excluir
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-white mb-2" style={{ fontSize: 18 }}>{post.content}</p>
                    {post.image && (
                      <div className="mb-2">
                        <Image
                          src={post.image}
                          width={600}
                          height={320}
                          className="rounded-xl"
                          alt="Imagem do post"
                          style={{ objectFit: "cover", maxHeight: 350 }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-5 text-zinc-400 mt-2 mb-2">
                    <button onClick={() => handleLikePost(post.id)} className="flex items-center gap-1 group">
                      <FiHeart className={hasLiked ? "text-pink-500" : ""} /> {post.postLikes?.length || 0}
                    </button>
                    <button className="flex items-center gap-1 group">
                      <FiMessageCircle /> {post.comments?.length || 0}
                    </button>
                    <button onClick={() => handleSharePost(post)} className="flex items-center gap-1 group">
                      <FiShare2 />
                    </button>
                  </div>
                  <CommentsList postId={post.id} currentUserId={org.id} />
                  <CommentForm
                    postId={post.id}
                    authorId={org.id}
                    onCommented={() => {
                      fetch(`/api/posts?userId=${id}`)
                        .then(res => res.json())
                        .then(data => setPosts(data || []));
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}