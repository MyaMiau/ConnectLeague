import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import ReplyThread from "@/components/ReplyThread";

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

  // Player-like posts logic
  const [loggedUser, setLoggedUser] = useState(null);
  const [activeOptions, setActiveOptions] = useState(null);
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [activeReplyMenu, setActiveReplyMenu] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // <- ADICIONE ISSO!
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", postId: null, commentId: null, replyId: null });

  const commentMenuRef = useRef({});
  const postMenuRef = useRef({});

  // Modal/forms para vaga/post
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
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.vagas || []).filter(vaga =>
          vaga.organizationId == id || vaga.organization?.id == id
        );
        setVagas(filtered);
      });
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  }, [id]);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setLoggedUser(data);
        }
      } catch {
        setLoggedUser(null);
      }
    }
    fetchMe();
  }, []);

  // Funções para permissões dos menus
  const canEditOrDeletePost = (post) => loggedUser?.id === post.authorId;
  const canEditOrDeleteComment = (comment) => loggedUser?.id === comment.authorId;

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
    let imageUrl = "";
    if (postData.image) {
      imageUrl = await uploadImageIfNeeded(postData.image);
      if (!imageUrl) {
        return;
      }
    }
    const payload = {
      content: postData.content,
      image: imageUrl,
      authorId: id
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

  // ----------- POSTS ----------- (restante igual ao profile id!)
  // ... handlers: toggleLikePost, addComment, etc (já estão acima)
  const toggleLikePost = async (postId) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    setPosts(posts =>
      posts.map(post =>
        post.id !== postId
          ? post
          : {
              ...post,
              postLikes: post.postLikes?.some(l => l.userId === loggedUser?.id)
                ? post.postLikes.filter(l => l.userId !== loggedUser?.id)
                : [...(post.postLikes || []), { userId: loggedUser?.id }],
            }
      )
    );
  };

  const toggleLikeComment = async (commentId, postId) => {
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    setPosts(posts =>
      posts.map(post =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.map(comment =>
                comment.id !== commentId
                  ? comment
                  : {
                      ...comment,
                      commentLikes: comment.commentLikes?.some(l => l.userId === loggedUser?.id)
                        ? comment.commentLikes.filter(l => l.userId !== loggedUser?.id)
                        : [...(comment.commentLikes || []), { userId: loggedUser?.id }],
                    }
              ),
            }
      )
    );
  };

  function insertReplyNested(replies, parentReplyId, newReply) {
    if (!replies) return [];
    return replies.map(reply =>
      reply.id === parentReplyId
        ? { ...reply, subReplies: [...(reply.subReplies || []), newReply] }
        : { ...reply, subReplies: insertReplyNested(reply.subReplies, parentReplyId, newReply) }
    );
  }
  function updateReplyContent(replies, replyId, content) {
    return replies
      ? replies.map(reply =>
          reply.id === replyId
            ? { ...reply, content }
            : {
                ...reply,
                subReplies: updateReplyContent(reply.subReplies, replyId, content),
              }
        )
      : [];
  }
  function removeReplyById(replies, replyId) {
    if (!replies) return [];
    return replies
      .filter(reply => reply.id !== replyId)
      .map(reply => ({
        ...reply,
        subReplies: removeReplyById(reply.subReplies, replyId),
      }));
  }

  const addComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !loggedUser?.id) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUser.id,
        postId,
      }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: [...post.comments, newComment],
              }
        )
      );
      setCommentInputs({ ...commentInputs, [postId]: "" });
    }
  };

  const saveEditedPost = async (post) => {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingPost.content }),
    });
    setEditingPost(null);
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  };

  const saveEditedComment = async (postId, commentId, content) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const updatedComment = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId ? comment : { ...comment, ...updatedComment }
                ),
              }
        )
      );
      setEditingComment(null);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId),
              }
        )
      );
    }
  };

  const handleReply = async (postId, commentId, text, parentReplyId = null) => {
    if (!text?.trim() || !loggedUser?.id) return;
    const res = await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUser.id,
        postId,
        commentId,
        parentReplyId,
      }),
    });
    if (res.ok) {
      const newReply = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: parentReplyId
                          ? insertReplyNested(comment.replies, parentReplyId, newReply)
                          : [...(comment.replies || []), newReply],
                      }
                ),
              }
        )
      );
      setReplyInputs({ ...replyInputs, [parentReplyId || commentId]: "" });
    }
  };

  const saveEditedReply = async (postId, commentId, replyId, content) => {
    const res = await fetch(`/api/comments/reply/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const updatedReply = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: updateReplyContent(comment.replies, replyId, updatedReply.content),
                      }
                ),
              }
        )
      );
      setEditingReply(null);
    }
  };

  const handleDeleteReply = async (postId, commentId, replyId) => {
    const res = await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: removeReplyById(comment.replies, replyId),
                      }
                ),
              }
        )
      );
    }
  };

  const onEditReply = (reply, commentId) => setEditingReply({ ...reply, commentId });

  const toggleReplyInput = (commentOrReplyId) => {
    setReplyInputs(prev => ({ ...prev, [commentOrReplyId]: prev[commentOrReplyId] ? "" : "" }));
  };

  const openDeleteModal = ({ type, postId, commentId = null, replyId = null }) => {
    setDeleteTarget({ type, postId, commentId, replyId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "comment") {
      await handleDeleteComment(deleteTarget.postId, deleteTarget.commentId);
    } else if (deleteTarget.type === "reply") {
      await handleDeleteReply(deleteTarget.postId, deleteTarget.commentId, deleteTarget.replyId);
    }
    setIsDeleteModalOpen(false);
  };

  const handleShare = (postId) => {
    if (navigator.share) {
      navigator.share({
        title: 'Post',
        url: `${window.location.origin}/post/${postId}`,
      });
    } else {
      window.open(`${window.location.origin}/post/${postId}`, "_blank");
    }
  };

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
                  <MoreHorizontal size={28} color="#A78BFA" />
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
          {posts.map((post) => (
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
                  {canEditOrDeletePost(post) && (
                    <div className="relative" ref={el => postMenuRef.current[post.id] = el}>
                      <button
                        type="button"
                        aria-label="Abrir menu de opções do post"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveOptions(activeOptions === post.id ? null : post.id);
                        }}
                        className="flex items-center"
                      >
                        <MoreHorizontal className="text-zinc-400 hover:text-white cursor-pointer" />
                      </button>
                      {activeOptions === post.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded shadow-md z-10">
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                            onClick={() => {
                              setEditingPost({ ...post });
                              setActiveOptions(null);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                            onClick={() => {
                              setDeleteTarget({ type: "post", postId: post.id });
                              setIsDeleteModalOpen(true);
                              setActiveOptions(null);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Campo de edição de post */}
                {editingPost?.id === post.id ? (
                  <>
                    <Textarea
                      className="mb-2"
                      value={editingPost.content}
                      onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEditedPost(post)}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPost(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="whitespace-pre-line">{post.content}</p>
                )}

                {post.image && (
                  <Image
                    src={post.image}
                    alt="Imagem do post"
                    width={800}
                    height={400}
                    className="rounded-xl object-cover"
                  />
                )}
                <div className="flex gap-6 pt-2 border-t border-zinc-800 mt-2 text-sm text-zinc-400 ">
                  <button
                    type="button"
                    onClick={() => toggleLikePost(post.id)}
                    className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                    <Heart className={post.postLikes?.some(l => l.userId === loggedUser?.id) ? "text-pink-500" : ""} size={18} />
                    <span>{post.postLikes?.length || 0}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                    <MessageCircle size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                    <Share2 size={18} />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <div className="flex gap-3 items-center">
                          <Link href={`/profile/${comment.author?.id || ""}`} className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative w-[30px] h-[30px] rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                              <Image
                                src={comment.author?.image || "/default-avatar.png"}
                                alt="Avatar"
                                fill
                                sizes="30px"
                                className="object-cover"
                                priority
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-100 group-hover:underline">{comment.author?.name || "Desconhecido"}</p>
                              {editingComment?.id === comment.id ? (
                                <>
                                  <Textarea
                                    className="text-sm"
                                    value={editingComment.content}
                                    onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="mt-1"
                                    onClick={() => saveEditedComment(post.id, comment.id, editingComment.content)}>
                                    Salvar
                                  </Button>
                                </>
                              ) : (
                                <p className="text-sm text-zinc-300">{comment.content}</p>
                              )}
                            </div>
                          </Link>
                        </div>
                        {canEditOrDeleteComment(comment) && (
                          <div className="relative" ref={el => commentMenuRef.current[comment.id] = el}>
                            <button
                              type="button"
                              tabIndex={0}
                              aria-label="Abrir menu de opções do comentário"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveCommentOptions(
                                  activeCommentOptions === comment.id ? null : comment.id
                                );
                              }}
                              className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                              <MoreHorizontal size={16} />
                            </button>
                            {activeCommentOptions === comment.id && (
                              <div
                                className="absolute right-0 mt-2 w-32 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingComment(comment);
                                    setActiveCommentOptions(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openDeleteModal({ type: "comment", postId: post.id, commentId: comment.id });
                                    setActiveCommentOptions(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                        <button
                          type="button"
                          onClick={() => toggleLikeComment(comment.id, post.id)}
                          className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                          <Heart className={comment.commentLikes?.some(l => l.userId === loggedUser?.id) ? "text-pink-500" : ""} size={14} />
                          <span>{comment.commentLikes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleReplyInput(comment.id)}
                          className="flex items-center gap-1 text-sm hover:underline cursor-pointer">
                          <MessageCircle size={14} />
                          <span>Responder</span>
                        </button>
                      </div>
                      {replyInputs[comment.id] !== undefined && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            className="h-10"
                            value={replyInputs[comment.id]}
                            onChange={(e) =>
                              setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
                            }
                            placeholder="Responder..."
                          />
                          <Button
                            type="button"
                            className="h-10 py-0 px-4"
                            onClick={() => handleReply(post.id, comment.id, replyInputs[comment.id])}>
                            Enviar
                          </Button>
                        </div>
                      )}
                      {comment.replies?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {comment.replies.map((reply) => (
                            <ReplyThread
                              key={reply.id}
                              reply={reply}
                              postId={post.id}
                              commentId={comment.id}
                              editingReply={editingReply}
                              setEditingReply={setEditingReply}
                              saveEditedReply={saveEditedReply}
                              openDeleteModal={openDeleteModal}
                              activeReplyMenu={activeReplyMenu}
                              setActiveReplyMenu={setActiveReplyMenu}
                              replyInputs={replyInputs}
                              setReplyInputs={setReplyInputs}
                              onReply={handleReply}
                              onEditReply={onEditReply}
                              loggedUser={loggedUser}
                              depth={1}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Input
                      className="h-10"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Escreva um comentário..."
                    />
                    <Button
                      type="button"
                      className="h-10 py-0 px-4"
                      onClick={() => addComment(post.id)}>
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            itemType={deleteTarget.type}
          />
        </div>
      </main>
    </div>
  );
}