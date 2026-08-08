'use client';

export default function DeleteButton() {
  return (
    <button
      type="submit"
      className="text-red-600 hover:text-red-800"
      onClick={(event) => {
        if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
          event.preventDefault();
        }
      }}
    >
      Eliminar
    </button>
  );
}
