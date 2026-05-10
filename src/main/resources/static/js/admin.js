"use strict";

const filtroUsuario = document.querySelector("#filtroUsuario");
const filasBarajas = document.querySelectorAll(".baraja-admin-item");
const contadorBarajas = document.querySelector("#contadorBarajasAdmin");
const modalEliminar = document.querySelector("#modalEliminarAdmin");
const textoConfirmar = document.querySelector("#textoConfirmarEliminar");
const formEliminar = document.querySelector("#formEliminarAdmin");

contadorBarajas.textContent = filasBarajas.length;

// ── Filtro por usuario ──
filtroUsuario.addEventListener("change", () => {
  const usuarioId = filtroUsuario.value;
  let visibles = 0;

  filasBarajas.forEach((fila) => {
    let coincide = false;

    if (usuarioId === "") {
      coincide = true;
    } else if (fila.dataset.usuarioId === usuarioId) {
      coincide = true;
    }
    fila.style.display = coincide ? "" : "none";
    if (coincide) visibles++;
  });

  contadorBarajas.textContent = visibles;
});

// ── Modal de confirmación ──
function abrirModalEliminar(formAction, texto) {
  formEliminar.action = formAction;
  textoConfirmar.textContent = texto;
  modalEliminar.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function cerrarModalEliminar() {
  modalEliminar.classList.add("hidden");
  document.body.style.overflow = "";
  formEliminar.action = "";
}

// ── Evento delegado ──
document.addEventListener("click", (e) => {
  const btnEliminar = e.target.closest("[data-action='eliminar-admin']");
  if (btnEliminar) {
    abrirModalEliminar(
      btnEliminar.dataset.formAction,
      btnEliminar.dataset.texto,
    );
    return;
  }

  if (e.target.closest("[data-action='cancelar-eliminar-admin']")) {
    cerrarModalEliminar();
    return;
  }

  // Cerrar al hacer clic en el fondo oscuro del modal
  if (e.target === modalEliminar) {
    cerrarModalEliminar();
  }
});
