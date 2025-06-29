"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreatePost({ onPost, user }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!text.trim() || !user?.id ) return;
    setLoading(true);

    // Monta o payload
    const payload = {
      content: text,
      image,
      authorId: user?.id, // Garanta que user.id está certo!
    };
 
    console.log("Payload enviado para /api/posts:", payload);

    // Faz o POST na API do backend
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setText("");
      setImage(null);
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
        <Button onClick={handlePost} disabled={loading || !text.trim()}>
          {loading ? "Publicando..." : "Publicar"}
        </Button>
      </CardContent>
    </Card>
  );
}