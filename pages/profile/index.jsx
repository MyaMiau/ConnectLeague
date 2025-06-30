import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import CreatePost from "@/components/CreatePost";
import Header from "@/components/Header";
import EditPostModal from "@/components/EditPostModal";
import ProfileCard from "@/components/ProfileCard";


export default function ProfilePage() {
  const [isRiotLinked, setIsRiotLinked] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const [activeOptions, setActiveOptions] = useState(null);
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", postId: null, commentId: null });
  const [activeReplyMenu, setActiveReplyMenu] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  // 1. Busca o usuário logado
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  // 2. Busca posts do usuário logado
  const loadUserPosts = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/posts?userId=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setPosts([]);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserPosts();
    }
    // eslint-disable-next-line
  }, [user]);

  // Ao criar novo post, recarrega os posts do usuário
  const handleNewPost = () => {
    loadUserPosts();
  };

  const toggleLikePost = async (id) => {
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
    loadUserPosts();
  };

  const toggleLikeComment = async (postId, commentId) => {
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    loadUserPosts();
  };

  const addComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !user?.id) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: user.id,
        postId,
      }),
    });
    setCommentInputs({ ...commentInputs, [postId]: "" });
    loadUserPosts();
  };

  const toggleReplyInput = (commentId) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: prev[commentId] ? "" : "" }));
  };

  const handleReply = async (postId, commentId, text) => {
    if (!text.trim() || !user?.id) return;
    await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: user.id,
        postId,
        commentId,
      }),
    });
    setReplyInputs({ ...replyInputs, [commentId]: "" });
    loadUserPosts();
  };

  const handleDeletePost = async (id) => {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadUserPosts();
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditingContent(post.content);
  };

  const saveEditedPost = async (id) => {
    await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingContent }),
    });
    setEditingPostId(null);
    setEditingContent("");
    loadUserPosts();
  };

  const handleDeleteComment = async (postId, commentId) => {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    loadUserPosts();
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
  };

  const saveEditedComment = async (postId, commentId, content) => {
    await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingComment(null);
    loadUserPosts();
  };

  const handleDeleteReply = async (postId, commentId, replyId) => {
    await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    loadUserPosts();
  };

  const handleEditReply = (reply, commentId) => {
    setEditingReply({
      id: reply.id,
      content: reply.content,
      commentId,
    });
  };

  const saveEditedReply = async (postId, commentId, replyId, content) => {
    await fetch(`/api/comments/reply/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingReply(null);
    loadUserPosts();
  };

  const openDeleteModal = ({ type, postId, commentId = null, replyId = null }) => {
    setDeleteTarget({ type, postId, commentId, replyId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "post") {
      await handleDeletePost(deleteTarget.postId);
    } else if (deleteTarget.type === "comment") {
      await handleDeleteComment(deleteTarget.postId, deleteTarget.commentId);
    } else if (deleteTarget.type === "reply") {
      await handleDeleteReply(deleteTarget.postId, deleteTarget.commentId, deleteTarget.replyId);
    }
    setIsDeleteModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 flex flex-col items-center px-4">
      <Header />

      <h1 className="text-3xl font-bold mb-8">Perfil do Jogador</h1>

      <ProfileCard user={user} onUserUpdate={setUser} />

      {/* Timeline */}
      <CreatePost user={user} onPost={handleNewPost} />

      <div className="w-full max-w-2xl space-y-6">
        {posts.length === 0 && (
          <p className="text-center text-zinc-400">Nenhum post encontrado para este usuário.</p>
        )}
        {posts.map((post) => (
          <Card key={post.id} className="bg-zinc-900 rounded-2xl">
            <CardContent className="p-6 space-y-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Image
                    src={post.author?.image || "/default-avatar.png"}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-zinc-700"      
                  />
                  <div>
                    <p className="font-semibold">{post.author?.name || "Usuário Exemplo"}</p>
                    <p className="text-xs text-zinc-400">
                      {format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setActiveOptions(post.id === activeOptions ? null : post.id)}>
                    <MoreHorizontal className="text-zinc-400 hover:text-white cursor-pointer" />
                  </button>
                  {activeOptions === post.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded shadow-md z-10 cursor-pointer">
                      <button onClick={() => handleEditPost(post)} className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer">
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal({ type: "post", postId: post.id })}
                        className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer">
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingPostId === post.id ? (
                <div className="space-y-2 cursor-pointer">
                  <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                  <Button onClick={() => saveEditedPost(post.id)}>Salvar</Button>
                </div>
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
                  onClick={() => toggleLikePost(post.id)}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <Heart className={post.liked ? "text-pink-500" : ""} size={18} />
                  <span>{post.likes}</span>
                </button>
                <button onClick={() => setCommentInputs({ ...commentInputs, [post.id]: "" })}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <MessageCircle size={18} />
                </button>
                <button onClick={() => navigator.share?.({ title: "Post", url: window.location.href })}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Comentários */}
              <div className="mt-4 space-y-4">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="bg-zinc-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <Image src={comment.author?.image || "/default-avatar.png"} 
                        alt="Avatar" 
                        width={30} 
                        height={30} 
                        className="rounded-full" 
                        style={{ width: 30, height: 30 }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-zinc-100S">{comment.author?.name || comment.author}</p>
                          {editingComment?.id === comment.id ? (
                            <>
                              <Textarea
                                className="text-sm"
                                value={editingComment.content}
                                onChange={(e) =>
                                  setEditingComment({ ...editingComment, content: e.target.value })}/>
                              <Button
                                size="sm"
                                className="mt-1"
                                onClick={() =>
                                  saveEditedComment(post.id, comment.id, editingComment.content)}>
                                Salvar
                              </Button>
                            </>
                          ) : (
                            <p className="text-sm text-zinc-300">{comment.content}</p>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveCommentOptions(
                              activeCommentOptions === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                          <MoreHorizontal size={16} />
                        </button>
                        {activeCommentOptions === comment.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10">
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                              Editar
                            </button>
                            <button
                              onClick={() => openDeleteModal({ type: "comment", postId: post.id, commentId: comment.id })}
                              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                   <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                    <button
                      onClick={() => toggleLikeComment(post.id, comment.id)}
                      className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                      <Heart className={comment.liked ? "text-pink-500" : ""} size={14} />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => toggleReplyInput(comment.id)}
                      className="flex items-center gap-1 text-sm hover:underline cursor-pointer">
                      <MessageCircle size={14} />
                      <span>Responder</span>
                    </button>
                  </div>

                    {/* Campo de resposta */}
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
                        className="h-10 py-0 px-4"
                        onClick={() =>
                          handleReply(post.id, comment.id, replyInputs[comment.id])}>
                        Enviar
                      </Button>
                 </div>
                    )}
                    

                    {/* Respostas */}
                    {comment.replies?.length > 0 && (
                      <div className="ml-10 mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="text-sm text-zinc-300 flex justify-between">
                            <div className="flex gap-2 items-start">
                              <Image
                                src={reply.author?.image || "/default-avatar.png"}
                                alt="Avatar"
                                width={25}
                                height={25}
                                className="rounded-full"                    
                                />
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-purple-400">{reply.author?.name || reply.author}</p>
                                {editingReply?.id === reply.id ? (
                                  <>
                                    <Textarea
                                      className="text-sm mt-1"
                                      value={editingReply.content}
                                      onChange={(e) =>
                                        setEditingReply({ ...editingReply, content: e.target.value })}/>
                                    <div className="mt-1 flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                        saveEditedReply(post.id, comment.id, reply.id, editingReply.content)}>
                                        Salvar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingReply(null)}>
                                        Cancelar
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-zinc-300">{reply.content}</p>
                            )}
                              </div>
                            </div>

                            <div className="relative">
                              <button
                               onClick={() =>
                               setActiveReplyMenu(
                                activeReplyMenu === reply.id ? null :reply.id)}
                                className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                                <MoreHorizontal size={14} />
                              </button>

                              {activeReplyMenu === reply.id && (
                                <div className="absolute right-0 mt-2 w-28 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10">
                                  <button
                                    onClick={() => {
                                      handleEditReply(reply, comment.id);
                                      setActiveReplyMenu(null);}}
                                    className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => {
                                      openDeleteModal({
                                        type: "reply",
                                        postId: post.id,
                                        commentId: comment.id,
                                        replyId: reply.id,
                                      });
                                      setActiveReplyMenu(null);}}
                                    className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                                    Excluir
                                  </button>
                                </div>
                              )}   
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {commentInputs[post.id] !== undefined && (
                  <div className="flex gap-2 mt-2">
                  <Input
                    className="h-10"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder="Escreva um comentário..."/>
                  <Button
                    className="h-10 py-0 px-4"
                    onClick={() => addComment(post.id)}>
                    Enviar
                  </Button>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType={deleteTarget.type}/>
    </div>
  );
}