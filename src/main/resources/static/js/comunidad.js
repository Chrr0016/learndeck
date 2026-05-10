"use strict";

const todasBarajas = document.querySelectorAll(".baraja-gestion");
const filtraNombre = document.querySelector("#filtraNombre");
const filtroCategoria = document.querySelector("#filtroCategoria");

// Registramos los ids guardados durante esta sesión de navegador
// para evitar que el usuario pulse "guardar" dos veces en la misma baraja
const yaGuardadas = [];


function filtrar() {
  const nombre = filtraNombre ? filtraNombre.value.toLowerCase() : "";
  const categoria = filtroCategoria ? filtroCategoria.value.toLowerCase() : "";

  todasBarajas.forEach((baraja) => {
    const titulo = (baraja.dataset.titulo || "").toLowerCase();
    const cat = (baraja.dataset.categoria || "").toLowerCase();
    const esVisible = titulo.includes(nombre) && (!categoria || cat === categoria);
    baraja.style.display = esVisible ? "" : "none";
  });
}

if (filtraNombre) filtraNombre.addEventListener("input", filtrar);
if (filtroCategoria) filtroCategoria.addEventListener("change", filtrar);

// Guardar copia en mi colección
async function guardarCopia(id, titulo) {
  if (yaGuardadas.includes(id)) {
    mostrarToast("Ya guardaste esta baraja en esta sesión.", "info");
    return;
  }

  try {
    const res = await fetch(`/barajas/${id}/guardar-copia`, { method: "POST" });

    if (res.ok) {
      yaGuardadas.push(id);
      mostrarToast(`"${titulo}" guardada en tu colección.`, "exito");
      marcarComoGuardada(id);
    } else if (res.status === 409) {
      mostrarToast("Ya tienes esta baraja en tu colección.", "info");
    } else {
      mostrarToast("Error al guardar. Inténtalo de nuevo.", "error");
    }
  } catch (err) {
    mostrarToast("Error de conexión. Inténtalo de nuevo.", "error");
  }
}

// cambia el borde de la card y añade un badge
// sin recargar la página
function marcarComoGuardada(id) {
  const card = document.querySelector(`.baraja-gestion[data-id="${id}"]`);
  if (!card) return;

  card.style.borderColor = "rgba(74, 222, 128, 0.5)";
  card.style.boxShadow = "0 0 20px rgba(74, 222, 128, 0.1)";

  // Añadimos un badge visible de "guardada"
  const footer = card.querySelector(".baraja-gestion-footer");
  if (footer) {
    const badge = document.createElement("div");
    badge.className = "badge-guardada";
    badge.textContent = "✓ guardada";
    card.insertBefore(badge, footer);
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='guardar-copia']");
  if (!btn) return;
  e.stopPropagation();
  guardarCopia(btn.dataset.id, btn.dataset.titulo);
});