//EditPostModal.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function EditPostModal({ isOpen, onClose, onSave, post }) {
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (post) {
      setEditedContent(post.content);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Post</h2>
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full h-32 mb-4"/>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave({ ...post, content: editedContent });
              onClose();
            }}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}