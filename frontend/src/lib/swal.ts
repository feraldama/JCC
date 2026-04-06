import Swal from "sweetalert2";

export function confirmarEliminacion(nombre: string): Promise<boolean> {
  return Swal.fire({
    title: "¿Estás seguro?",
    text: `Se eliminará ${nombre}. Esta acción no se puede deshacer.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => result.isConfirmed);
}

export function confirmarAnulacion(nombre: string): Promise<boolean> {
  return Swal.fire({
    title: "¿Anular comprobante?",
    text: `Se anulará ${nombre}. El registro quedará marcado como ANULADO.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, anular",
    cancelButtonText: "Cancelar",
  }).then((result) => result.isConfirmed);
}

export function mostrarExito(mensaje: string) {
  return Swal.fire({
    icon: "success",
    title: mensaje,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
}

export function mostrarError(mensaje: string) {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: mensaje,
  });
}
