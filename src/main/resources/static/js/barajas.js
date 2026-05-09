"use strict";

// ── Referencias ──
const todasBarajas = document.querySelectorAll(".baraja-gestion");
const contadorVisible = document.querySelector("#contadorVisible");
const filtraNombre = document.querySelector("#filtraNombre");
const filtroCategoria = document.querySelector("#filtroCategoria");
const modalGestionBaraja = document.querySelector("#modalGestionBaraja");
const formGestionBaraja = document.querySelector("#formGestionBaraja");
const gbError = document.querySelector("#gbError");
const modalEliminar = document.querySelector("#modalEliminar");
const formEliminar = document.querySelector("#formEliminar");
const nombreBarajaEliminar = document.querySelector("#nombreBarajaEliminar");
const modalBaraja = document.querySelector("#modalBaraja");
const modalTitulo = document.querySelector("#modalTitulo");
const modalMeta = document.querySelector("#modalMeta");
const modalContador = document.querySelector("#modalContador");
const listaTarjetas = document.querySelector("#listaTarjetas");
const buscarTarjeta = document.querySelector("#buscarTarjeta");
const modalBtnEditar = document.querySelector("#modalBtnEditar");
const modalNuevaTarjeta = document.querySelector("#modalNuevaTarjeta");
const ntBtnSubmit = document.querySelector("#ntBtnSubmit");
const modalEliminarTarjeta = document.querySelector("#modalEliminarTarjeta");

let tarjetasActuales = [];
let barajaActualId = null;
let tarjetaPendienteEliminar = null;

const LIMITE_NOMBRE_BARAJA = 50;
const LIMITE_CATEGORIA = 30;
const LIMITE_PREGUNTA = 300;
const LIMITE_RESPUESTA = 500;

if (contadorVisible) contadorVisible.textContent = todasBarajas.length;

// ── Filtros ──
function filtrar() {
  const nombre = filtraNombre ? filtraNombre.value.toLowerCase() : "";
  const categoria = filtroCategoria ? filtroCategoria.value.toLowerCase() : "";
  let visibles = 0;

  todasBarajas.forEach((baraja) => {
    const titulo = (baraja.dataset.titulo || "").toLowerCase();
    const cat = (baraja.dataset.categoria || "").toLowerCase();
    const visible =
      titulo.includes(nombre) && (!categoria || cat === categoria);
    baraja.style.display = visible ? "" : "none";
    if (visible) visibles++;
  });

  if (contadorVisible) contadorVisible.textContent = visibles;
}

if (filtraNombre) filtraNombre.addEventListener("input", filtrar);
if (filtroCategoria) filtroCategoria.addEventListener("change", filtrar);

// ── Abrir/cerrar modales de baraja ──
const abrirModalNuevaBaraja = function () {
  gbError.classList.add("hidden");
  document.querySelector("#gbId").value = "";
  document.querySelector("#gbTitulo").value = "";
  document.querySelector("#gbCategoria").value = "";
  document.querySelector("#gbTituloModal").textContent = "Nueva baraja";
  modalGestionBaraja.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const abrirModalEditarBaraja = function (id, titulo, categoria) {
  gbError.classList.add("hidden");
  document.querySelector("#gbId").value = id;
  document.querySelector("#gbTitulo").value = titulo;
  document.querySelector("#gbCategoria").value =
    categoria === "null" ? "" : categoria;
  document.querySelector("#gbTituloModal").textContent = "Editar baraja";
  modalGestionBaraja.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const prepararEdicionBaraja = function (elemento) {
  abrirModalEditarBaraja(
    elemento.getAttribute("data-id"),
    elemento.getAttribute("data-titulo"),
    elemento.getAttribute("data-categoria"),
  );
};

const cerrarModalGestionBaraja = function () {
  modalGestionBaraja.classList.add("hidden");
  document.body.style.overflow = "";
};

// ── Guardar baraja (crear o editar) ──
if (formGestionBaraja) {
  formGestionBaraja.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.querySelector("#gbId").value;
    const titulo = document.querySelector("#gbTitulo").value.trim();
    const categoria = document.querySelector("#gbCategoria").value.trim();

     if (!titulo) {
      gbError.textContent = "El nombre de la baraja no puede estar vacío.";
      gbError.classList.remove("hidden");
      return;
    }

    if (titulo.length > LIMITE_NOMBRE_BARAJA) {
      gbError.textContent = `El nombre no puede superar ${LIMITE_NOMBRE_BARAJA} caracteres.`;
      gbError.classList.remove("hidden");
      return;
    }


    if (!categoria) {
      gbError.textContent = "La categoría no puede estar vacía.";
      gbError.classList.remove("hidden");
      return;
    }

    if (categoria.length > LIMITE_CATEGORIA) {
      gbError.textContent = `La categoría no puede superar ${LIMITE_CATEGORIA} caracteres.`;
      gbError.classList.remove("hidden");
      return;
    }

    // Nombre duplicado 
    // (solo para creación, en edición comparamos excluyendo la propia baraja)
    const esEdicion = id !== "";
    const nombreDuplicado = [...todasBarajas].some((b) => {
      const mismoNombre = b.dataset.titulo?.toLowerCase() === titulo.toLowerCase();
      // en edición ignoramos la baraja que estamos editando
      const mismaBaraja = b.dataset.id === id;
      return mismoNombre && (!esEdicion || !mismaBaraja);
    });

    if (nombreDuplicado) {
      gbError.textContent = "Ya tienes una baraja con ese nombre.";
      gbError.classList.remove("hidden");
      return;
    }


    try {
      const res = await fetch("/barajas/guardar/ajax", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id, titulo, categoria }),
      });

      if (res.ok) {
        const esEdicion = id !== "";
        mostrarToast(
          esEdicion ? "Baraja actualizada." : "Baraja creada.",
          "exito",
        );
        setTimeout(() => window.location.reload(), 1200);
      } else {
        throw new Error();
      }
    } catch {
      gbError.textContent = "Ocurrió un error.";
      gbError.classList.remove("hidden");
      mostrarToast("Error al guardar la baraja.", "error");
    }
  });
}

// ── Confirmar eliminar baraja ──
const confirmarEliminar = function (id, titulo) {
  nombreBarajaEliminar.textContent = titulo;
  formEliminar.action = `/barajas/${id}/eliminar`;
  modalEliminar.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const cancelarEliminar = function () {
  modalEliminar.classList.add("hidden");
  document.body.style.overflow = "";
};

// ── Abrir detalle de baraja ──
const abrirBaraja = function (id) {
  barajaActualId = id;
  modalBaraja.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  fetch(`/barajas/${id}/tarjetas/json`)
    .then((res) => res.json())
    .then((data) => {
      tarjetasActuales = data.tarjetas || [];
      modalTitulo.textContent = data.titulo || "Baraja";
      modalMeta.textContent = `${tarjetasActuales.length} tarjetas · ${data.categoria || "sin categoría"}`;
      modalContador.textContent = `${tarjetasActuales.length} tarjetas`;

      // Guardamos datos en el botón para usarlos al pulsar "Editar"
      modalBtnEditar.dataset.id = data.id;
      modalBtnEditar.dataset.titulo = data.titulo;
      modalBtnEditar.dataset.categoria = data.categoria;

      renderizarTarjetas(tarjetasActuales);
    })
    .catch(() => {
      listaTarjetas.innerHTML = `<div class="text-center py-10 text-red-400">Error cargando tarjetas.</div>`;
      mostrarToast("Error al cargar las tarjetas.", "error");
    });
};

const cerrarModal = function () {
  modalBaraja.classList.add("hidden");
  document.body.style.overflow = "";
  barajaActualId = null;
  tarjetasActuales = [];
  if (buscarTarjeta) buscarTarjeta.value = "";
};

// Buscar dentro del modal
if (buscarTarjeta) {
  buscarTarjeta.addEventListener("input", () => {
    const busqueda = buscarTarjeta.value.toLowerCase();
    renderizarTarjetas(
      tarjetasActuales.filter(
        (t) =>
          t.pregunta.toLowerCase().includes(busqueda) ||
          t.respuesta.toLowerCase().includes(busqueda),
      ),
    );
  });
}

// ── Renderizar lista de tarjetas ──
function renderizarTarjetas(tarjetas) {
  if (tarjetas.length === 0) {
    listaTarjetas.innerHTML = `<div class="text-center py-10"><p class="text-gray-400">No se encontraron tarjetas.</p></div>`;
    return;
  }

  listaTarjetas.innerHTML = tarjetas
    .map(
      (t, i) => `
    <div class="tarjeta-item">
      <div class="tarjeta-item-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="tarjeta-item-contenido">
        <div class="tarjeta-item-pregunta">${t.pregunta}</div>
        <div class="tarjeta-item-respuesta">${t.respuesta}</div>
      </div>
      <div class="tarjeta-item-acciones">
        <button data-action="editar-tarjeta" data-id="${t.id}" class="tarjeta-btn tarjeta-btn-editar" title="Editar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button data-action="eliminar-tarjeta" data-id="${t.id}" class="tarjeta-btn tarjeta-btn-eliminar" title="Eliminar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

// ── Modal nueva/editar tarjeta ──
const abrirModalNuevaTarjeta = function () {
  document.querySelector("#ntTitulo").textContent = "Nueva tarjeta";
  document.querySelector("#ntBarajaNombre").textContent =
    modalTitulo.textContent;
  document.querySelector("#ntPregunta").value = "";
  document.querySelector("#ntRespuesta").value = "";
  document.querySelector("#ntError").classList.add("hidden");
  ntBtnSubmit.textContent = "Crear tarjeta";
  ntBtnSubmit.dataset.mode = "crear";
  delete ntBtnSubmit.dataset.tarjetaId;
  modalNuevaTarjeta.classList.remove("hidden");
  document.querySelector("#ntPregunta").focus();
};

const cerrarModalNuevaTarjeta = function () {
  modalNuevaTarjeta.classList.add("hidden");
};

const submitNuevaTarjeta = async function () {
  const preguntaInput = document.querySelector("#ntPregunta");
  const respuestaInput = document.querySelector("#ntRespuesta");
  const pregunta = preguntaInput.value.trim();
  const respuesta = respuestaInput.value.trim();

  if (!pregunta || !respuesta) {
    document.querySelector("#ntError").classList.remove("hidden");
    return;
  }
  if (pregunta.length > LIMITE_PREGUNTA) {
    errorEl.textContent = `La pregunta no puede superar ${LIMITE_PREGUNTA} caracteres.`;
    errorEl.classList.remove("hidden");
    return;
  }

  if (respuesta.length > LIMITE_RESPUESTA) {
    errorEl.textContent = `La respuesta no puede superar ${LIMITE_RESPUESTA} caracteres.`;
    errorEl.classList.remove("hidden");
    return;
  }

  ntBtnSubmit.disabled = true;
  ntBtnSubmit.textContent = "Guardando...";

  try {
    const res = await fetch(`/barajas/${barajaActualId}/tarjetas/nueva/ajax`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ pregunta, respuesta }),
    });

    if (res.ok) {
      const nueva = await res.json();
      tarjetasActuales.push(nueva);
      renderizarTarjetas(tarjetasActuales);
      modalContador.textContent = `${tarjetasActuales.length} tarjetas`;

      actualizarContadoresGlobales();
      preguntaInput.value = "";
      respuestaInput.value = "";
      preguntaInput.focus();
      ntBtnSubmit.textContent = "Crear tarjeta";
      ntBtnSubmit.disabled = false;
      mostrarToast("Tarjeta creada.", "exito");
    }
  } catch {
    ntBtnSubmit.disabled = false;
    ntBtnSubmit.textContent = "Crear tarjeta";
    mostrarToast("Error al crear la tarjeta.", "error");
  }
};

const abrirEditarTarjeta = async function (id) {
  const res = await fetch(`/tarjetas/${id}/json`);
  const t = await res.json();

  document.querySelector("#ntTitulo").textContent = "Editar tarjeta";
  document.querySelector("#ntPregunta").value = t.pregunta;
  document.querySelector("#ntRespuesta").value = t.respuesta;
  ntBtnSubmit.textContent = "Guardar cambios";
  ntBtnSubmit.dataset.mode = "editar";
  ntBtnSubmit.dataset.tarjetaId = id;
  modalNuevaTarjeta.classList.remove("hidden");
};

const submitEditarTarjeta = async function (id) {
  const pregunta = document.querySelector("#ntPregunta").value.trim();
  const respuesta = document.querySelector("#ntRespuesta").value.trim();


  if (!pregunta || !respuesta) {
    errorEl.textContent = "Rellena ambos campos.";
    errorEl.classList.remove("hidden");
    return;
  }

  if (pregunta.length > LIMITE_PREGUNTA) {
    errorEl.textContent = `La pregunta no puede superar ${LIMITE_PREGUNTA} caracteres.`;
    errorEl.classList.remove("hidden");
    return;
  }

  if (respuesta.length > LIMITE_RESPUESTA) {
    errorEl.textContent = `La respuesta no puede superar ${LIMITE_RESPUESTA} caracteres.`;
    errorEl.classList.remove("hidden");
    return;
  }



  const res = await fetch(`/tarjetas/${id}/editar/ajax`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ pregunta, respuesta }),
  });

  if (res.ok) {
    const index = tarjetasActuales.findIndex((t) => t.id === id);
    tarjetasActuales[index].pregunta = pregunta;
    tarjetasActuales[index].respuesta = respuesta;
    renderizarTarjetas(tarjetasActuales);
    cerrarModalNuevaTarjeta();
    mostrarToast("Tarjeta actualizada.", "exito");
  } else {
    mostrarToast("Error al actualizar la tarjeta.", "error");
  }
};

const actualizarContadoresGlobales = function () {
  const total = tarjetasActuales.length;

  modalContador.textContent = `${total} tarjetas`;

  let categoria = modalBtnEditar.dataset.categoria;
  categoria = !categoria || categoria === "null" ? "sin categoría" : categoria;
  modalMeta.textContent = `${total} tarjetas · ${categoria}`;

  const cardContador = document.querySelector(
    `.baraja-gestion[data-id="${barajaActualId}"] .baraja-gestion-meta span:first-child`,
  );
  if (cardContador) {
    cardContador.textContent = `${total} tarjetas`;
  }
};

// ── Eliminar tarjeta ──
const eliminarTarjeta = function (id) {
  tarjetaPendienteEliminar = id;
  modalEliminarTarjeta.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const confirmarEliminarTarjeta = async function () {
  if (!tarjetaPendienteEliminar) return;

  const id = tarjetaPendienteEliminar;
  const res = await fetch(`/tarjetas/${id}`, { method: "DELETE" });

  if (res.ok) {
    tarjetasActuales = tarjetasActuales.filter((t) => t.id !== id);
    renderizarTarjetas(tarjetasActuales);
    actualizarContadoresGlobales();
    modalContador.textContent = `${tarjetasActuales.length} tarjetas`;
    mostrarToast("Tarjeta eliminada.", "info");
  } else {
    mostrarToast("Error al eliminar la tarjeta.", "error");
  }

  tarjetaPendienteEliminar = null;
  modalEliminarTarjeta.classList.add("hidden");
  document.body.style.overflow = "";
};

const toggleCompartir = async function (id, boton) {
  const res = await fetch(`/barajas/${id}/compartir`, { method: "POST" });

  if (res.ok) {
    const estabaCompartida = boton.dataset.compartida === "true";
    boton.dataset.compartida = estabaCompartida ? "false" : "true";

    // Cambiamos la clase visual del botón
    boton.classList.toggle("accion-compartida", !estabaCompartida);
    boton.classList.toggle("accion-no-compartida", estabaCompartida);

    mostrarToast(
      estabaCompartida
        ? "Baraja retirada de la comunidad."
        : "Baraja compartida en la comunidad.",
      "info",
    );
  } else {
    mostrarToast("Error al cambiar el estado de la baraja.", "error");
  }
};

// ── Evento delegado global ──
document.addEventListener("click", (e) => {
  // Acciones del overlay — van primero para no activar abrirBaraja
  const btnEditarBaraja = e.target.closest("[data-action='editar-baraja']");
  if (btnEditarBaraja) {
    e.stopPropagation();
    prepararEdicionBaraja(btnEditarBaraja);
    return;
  }

  const btnEliminarBaraja = e.target.closest("[data-action='eliminar-baraja']");
  if (btnEliminarBaraja) {
    e.stopPropagation();
    confirmarEliminar(
      btnEliminarBaraja.dataset.id,
      btnEliminarBaraja.dataset.titulo,
    );
    return;
  }

  const btnCompartir = e.target.closest("[data-action='compartir-baraja']");
  if (btnCompartir) {
    e.stopPropagation();
    toggleCompartir(btnCompartir.dataset.id, btnCompartir);
    return;
  }

  // Abrir baraja al pulsar la card
  const barajaGestion = e.target.closest(".baraja-gestion");
  if (barajaGestion) {
    abrirBaraja(barajaGestion.dataset.id);
    return;
  }

  // Resto de acciones
  if (e.target.closest("[data-action='nueva-baraja']")) {
    abrirModalNuevaBaraja();
    return;
  }
  if (e.target.closest("[data-action='cerrar-modal-baraja']")) {
    cerrarModal();
    return;
  }
  if (e.target.closest("[data-action='nueva-tarjeta']")) {
    abrirModalNuevaTarjeta();
    return;
  }
  if (e.target.closest("[data-action='cerrar-modal-tarjeta']")) {
    cerrarModalNuevaTarjeta();
    return;
  }
  if (e.target.closest("[data-action='cerrar-gestion-baraja']")) {
    cerrarModalGestionBaraja();
    return;
  }
  if (e.target.closest("[data-action='cancelar-eliminar']")) {
    cancelarEliminar();
    return;
  }

  if (e.target.closest("[data-action='editar-baraja-modal']")) {
    e.preventDefault();
    abrirModalEditarBaraja(
      modalBtnEditar.dataset.id,
      modalBtnEditar.dataset.titulo,
      modalBtnEditar.dataset.categoria,
    );
    return;
  }

  if (e.target.closest("[data-action='submit-tarjeta']")) {
    ntBtnSubmit.dataset.mode === "editar"
      ? submitEditarTarjeta(Number(ntBtnSubmit.dataset.tarjetaId))
      : submitNuevaTarjeta();
    return;
  }

  const btnEditarTarjeta = e.target.closest("[data-action='editar-tarjeta']");
  if (btnEditarTarjeta) {
    abrirEditarTarjeta(Number(btnEditarTarjeta.dataset.id));
    return;
  }

  const btnEliminarTarjeta = e.target.closest(
    "[data-action='eliminar-tarjeta']",
  );
  if (btnEliminarTarjeta) {
    eliminarTarjeta(Number(btnEliminarTarjeta.dataset.id));
    return;
  }

  if (e.target.closest("[data-action='cancelar-eliminar-tarjeta']")) {
    tarjetaPendienteEliminar = null;
    modalEliminarTarjeta.classList.add("hidden");
    document.body.style.overflow = "";
    return;
  }

  if (e.target.closest("#btnConfirmarEliminarTarjeta")) {
    confirmarEliminarTarjeta();
    return;
  }

  // Cerrar modales al pulsar el fondo oscuro
  if (e.target === modalBaraja) {
    cerrarModal();
    return;
  }
  if (e.target === modalNuevaTarjeta) {
    cerrarModalNuevaTarjeta();
    return;
  }
  if (e.target === modalGestionBaraja) {
    cerrarModalGestionBaraja();
    return;
  }
  if (e.target === modalEliminar) {
    cancelarEliminar();
    return;
  }
  if (e.target === modalEliminarTarjeta) {
    tarjetaPendienteEliminar = null;
    modalEliminarTarjeta.classList.add("hidden");
    document.body.style.overflow = "";
  }
});
