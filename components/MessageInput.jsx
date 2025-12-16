import { useState } from "react";

export default function MessageInput({ onSend, disabled = false, placeholder = "Escreva..." }) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;
    await onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 resize-none bg-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        Enviar
      </button>
    </div>
  );
}