import { useEffect } from "react";

// Mientras `activo` sea true, pide confirmación antes de salir de la página:
// - al cerrar o recargar la pestaña (aviso nativo del navegador);
// - al hacer clic en un enlace interno (ej. el menú lateral).
// No cubre el botón "atrás" del navegador ni acciones que no sean enlaces.
export function useAvisoSalida(activo: boolean, mensaje: string) {
  useEffect(() => {
    if (!activo) return;

    function antesDeDescargar(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    function alHacerClic(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const enlace = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!enlace || enlace.target === "_blank" || enlace.hasAttribute("download")) return;
      const destino = new URL(enlace.href, window.location.href);
      if (destino.origin !== window.location.origin) return;
      if (destino.pathname === window.location.pathname && destino.search === window.location.search) return;
      if (!window.confirm(mensaje)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", antesDeDescargar);
    // Fase de captura: corre antes que el onClick de <Link> de Next
    document.addEventListener("click", alHacerClic, true);
    return () => {
      window.removeEventListener("beforeunload", antesDeDescargar);
      document.removeEventListener("click", alHacerClic, true);
    };
  }, [activo, mensaje]);
}
