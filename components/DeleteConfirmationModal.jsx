import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemType }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo com blur real */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative z-50 bg-zinc-900 rounded-2xl p-6 shadow-lg max-w-sm w-full border border-zinc-700">
        <Dialog.Title className="text-lg font-semibold text-white mb-2">
          Confirmar exclusão
        </Dialog.Title>
        <Dialog.Description className="text-sm text-zinc-400 mb-4">
          Tem certeza que deseja excluir este {itemType === "post" ? "post" : "comentário"}? Essa ação não pode ser desfeita.
        </Dialog.Description>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}