"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreatePost({ onPost, user }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // Caminho retornado pelo backend
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    // Faz upload imediatamente ao selecionar
    const formData = new FormData();
    formData.append("image", file);

    try {
      const resp = await fetch("/api/posts/upload", {
        method: "POST",
        body: formData,
      });
      if (resp.ok) {
        const data = await resp.json();
        setImageUrl(data.imageUrl); // ex: "/uploads/posts/abc123.jpg"
      } else {
        setImageUrl("");
        // Você pode mostrar erro aqui se quiser
      }
    } catch (err) {
      setImageUrl("");
      // Você pode mostrar erro aqui se quiser
    }
  };

  const handlePost = async () => {
    if (!text.trim() || !user?.id) return;
    setLoading(true);

    const payload = {
      content: text,
      image: imageUrl, // só o caminho!
      authorId: user?.id,
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setText("");
      setImageFile(null);
      setImageUrl("");
      onPost && onPost();
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl bg-zinc-900 mb-8 rounded-2xl">
      <CardContent className="p-6 space-y-4">
        <Textarea
          placeholder="Compartilhe algo profissional..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Prévia da imagem"
            className="max-w-xs max-h-48 rounded-lg mt-2"
          />
        )}
        <Button onClick={handlePost} disabled={loading || !text.trim()}>
          {loading ? "Publicando..." : "Publicar"}
        </Button>
      </CardContent>
    </Card>
  );
}