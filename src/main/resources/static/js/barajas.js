document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. CONFIGURACIÓN INICIAL Y ANIMACIONES
  // ==========================================
  const animados = document.querySelectorAll(".animado");
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  animados.forEach((el) => observador.observe(el));

  const todasBarajas = document.querySelectorAll(".baraja-gestion");
  const contadorVisible = document.getElementById("contadorVisible");
  if (contadorVisible) contadorVisible.textContent = todasBarajas.length;

  // ==========================================
  // 2. FILTROS Y BÚSQUEDA DE BARAJAS
  // ==========================================
  const filtraNombre = document.getElementById("filtraNombre");
  const filtroCategoria = document.getElementById("filtroCategoria");

  function filtrar() {
    const nombre = filtraNombre ? filtraNombre.value.toLowerCase() : "";
    const categoria = filtroCategoria
      ? filtroCategoria.value.toLowerCase()
      : "";
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

  // ==========================================
  // 3. GESTIÓN DE BARAJAS (CREAR / EDITAR)
  // ==========================================
  const modalGestionBaraja = document.getElementById("modalGestionBaraja");
  const formGestionBaraja = document.getElementById("formGestionBaraja");
  const gbError = document.getElementById("gbError");

  window.abrirModalNuevaBaraja = function () {
    gbError.classList.add("hidden");
    document.getElementById("gbId").value = "";
    document.getElementById("gbTitulo").value = "";
    document.getElementById("gbCategoria").value = "";
    document.getElementById("gbTituloModal").textContent = "Nueva baraja";
    modalGestionBaraja.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  window.prepararEdicionBaraja = function (elemento) {
    // Leemos los datos del botón que fue clickeado
    const id = elemento.getAttribute("data-id");
    const titulo = elemento.getAttribute("data-titulo");
    const categoria = elemento.getAttribute("data-categoria");

    // Llamamos a la función original que ya tienes en el JS
    abrirModalEditarBaraja(id, titulo, categoria);
  };
  window.abrirModalEditarBaraja = function (id, titulo, categoria) {
    gbError.classList.add("hidden");
    document.getElementById("gbId").value = id;
    document.getElementById("gbTitulo").value = titulo;
    document.getElementById("gbCategoria").value =
      categoria === "null" ? "" : categoria;
    document.getElementById("gbTituloModal").textContent = "Editar baraja";
    modalGestionBaraja.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  window.cerrarModalGestionBaraja = function () {
    modalGestionBaraja.classList.add("hidden");
    document.body.style.overflow = "";
  };

  if (formGestionBaraja) {
    formGestionBaraja.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("gbId").value;
      const titulo = document.getElementById("gbTitulo").value.trim();
      const categoria = document.getElementById("gbCategoria").value.trim();

      try {
        const res = await fetch("/barajas/guardar/ajax", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ id, titulo, categoria }),
        });
        if (res.ok) window.location.reload();
        else throw new Error();
      } catch (err) {
        gbError.classList.remove("hidden");
      }
    });
  }

  // ==========================================
  // 4. ELIMINAR BARAJA
  // ==========================================
  const modalEliminar = document.getElementById("modalEliminar");
  const formEliminar = document.getElementById("formEliminar");
  const nombreBarajaEliminar = document.getElementById("nombreBarajaEliminar");

  window.confirmarEliminar = function (id, titulo) {
    nombreBarajaEliminar.textContent = titulo;
    formEliminar.action = `/barajas/${id}/eliminar`;
    modalEliminar.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  window.cancelarEliminar = function () {
    modalEliminar.classList.add("hidden");
    document.body.style.overflow = "";
  };

  // ==========================================
  // 5. DETALLE DE BARAJA Y LISTADO DE TARJETAS
  // ==========================================
  const modalBaraja = document.getElementById("modalBaraja");
  const modalTitulo = document.getElementById("modalTitulo");
  const modalMeta = document.getElementById("modalMeta");
  const modalContador = document.getElementById("modalContador");
  const listaTarjetas = document.getElementById("listaTarjetas");
  const buscarTarjeta = document.getElementById("buscarTarjeta");
  const modalBtnEditar = document.getElementById("modalBtnEditar");

  let tarjetasActuales = [];
  let barajaActualId = null;

  window.abrirBaraja = function (id) {
    barajaActualId = id;
    modalBaraja.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Preparamos el botón editar del modal para que abra el modal de gestión
    fetch(`/barajas/${id}/tarjetas/json`)
      .then((res) => res.json())
      .then((data) => {
        tarjetasActuales = data.tarjetas || [];
        modalTitulo.textContent = data.titulo || "Baraja";
        modalMeta.textContent = `${tarjetasActuales.length} tarjetas · ${data.categoria || "sin categoría"}`;
        modalContador.textContent = `${tarjetasActuales.length} tarjetas`;

        // Configurar botón editar del modal
        modalBtnEditar.onclick = (e) => {
          e.preventDefault();
          abrirModalEditarBaraja(data.id, data.titulo, data.categoria);
        };

        renderizarTarjetas(tarjetasActuales);
      })
      .catch(() => {
        listaTarjetas.innerHTML = `<div class="text-center py-10 text-red-400">Error cargando tarjetas</div>`;
      });
  };

  function cerrarModal() {
    modalBaraja.classList.add("hidden");
    document.body.style.overflow = "";
    barajaActualId = null;
    tarjetasActuales = [];
    if (buscarTarjeta) buscarTarjeta.value = "";
  }

  if (document.getElementById("modalBtnCerrar")) {
    document
      .getElementById("modalBtnCerrar")
      .addEventListener("click", cerrarModal);
  }

  // ==========================================
  // 6. GESTIÓN DE TARJETAS (CREAR / EDITAR / ELIMINAR)
  // ==========================================
  const modalNuevaTarjeta = document.getElementById("modalNuevaTarjeta");
  const ntBtnSubmit = document.getElementById("ntBtnSubmit");

  // --- BUSCADOR DE TARJETAS (Dentro del modal) ---
  if (buscarTarjeta) {
    buscarTarjeta.addEventListener("input", () => {
      const busqueda = buscarTarjeta.value.toLowerCase();
      const filtradas = tarjetasActuales.filter(
        (t) =>
          t.pregunta.toLowerCase().includes(busqueda) ||
          t.respuesta.toLowerCase().includes(busqueda),
      );
      renderizarTarjetas(filtradas);
    });
  }

  function renderizarTarjetas(tarjetas) {
    if (tarjetas.length === 0) {
      listaTarjetas.innerHTML = `<div class="text-center py-10"><p class="text-gray-400">No se encontraron tarjetas</p></div>`;
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
                    <button onclick="abrirEditarTarjeta(${t.id})" class="tarjeta-btn tarjeta-btn-editar" title="Editar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="eliminarTarjeta(${t.id})" class="tarjeta-btn tarjeta-btn-eliminar" title="Eliminar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  window.abrirModalNuevaTarjeta = function () {
    document.getElementById("ntTitulo").textContent = "Nueva tarjeta";
    document.getElementById("ntBarajaNombre").textContent =
      modalTitulo.textContent;
    document.getElementById("ntPregunta").value = "";
    document.getElementById("ntRespuesta").value = "";
    document.getElementById("ntError").classList.add("hidden");
    ntBtnSubmit.textContent = "Crear tarjeta";
    ntBtnSubmit.onclick = submitNuevaTarjeta;
    modalNuevaTarjeta.classList.remove("hidden");
    document.getElementById("ntPregunta").focus();
  };

  window.submitNuevaTarjeta = async function () {
    const preguntaInput = document.getElementById("ntPregunta");
    const respuestaInput = document.getElementById("ntRespuesta");
    const pregunta = preguntaInput.value.trim();
    const respuesta = respuestaInput.value.trim();

    if (!pregunta || !respuesta) {
      document.getElementById("ntError").classList.remove("hidden");
      return;
    }

    ntBtnSubmit.disabled = true;
    ntBtnSubmit.textContent = "Guardando...";

    try {
      const res = await fetch(
        `/barajas/${barajaActualId}/tarjetas/nueva/ajax`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ pregunta, respuesta }),
        },
      );

      if (res.ok) {
        const nueva = await res.json();
        tarjetasActuales.push(nueva);

        // Actualizamos la UI sin cerrar
        renderizarTarjetas(tarjetasActuales);
        modalContador.textContent = `${tarjetasActuales.length} tarjetas`;

        // Limpiamos campos para la siguiente
        preguntaInput.value = "";
        respuestaInput.value = "";
        preguntaInput.focus();

        ntBtnSubmit.textContent = "Crear tarjeta";
        ntBtnSubmit.disabled = false;
        
      }
    } catch (err) {
      ntBtnSubmit.disabled = false;
      ntBtnSubmit.textContent = "Crear tarjeta";
    }
  };

  window.abrirEditarTarjeta = async function (id) {
    const res = await fetch(`/tarjetas/${id}/json`);
    const t = await res.json();
    document.getElementById("ntTitulo").textContent = "Editar tarjeta";
    document.getElementById("ntPregunta").value = t.pregunta;
    document.getElementById("ntRespuesta").value = t.respuesta;
    ntBtnSubmit.textContent = "Guardar cambios";
    ntBtnSubmit.onclick = () => submitEditarTarjeta(id);
    modalNuevaTarjeta.classList.remove("hidden");
  };

  window.submitEditarTarjeta = async function (id) {
    const pregunta = document.getElementById("ntPregunta").value.trim();
    const respuesta = document.getElementById("ntRespuesta").value.trim();

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
    }
  };

  window.eliminarTarjeta = function (id) {
    if (!confirm("¿Eliminar esta tarjeta?")) return;
    fetch(`/tarjetas/${id}`, { method: "DELETE" }).then((res) => {
      if (res.ok) {
        tarjetasActuales = tarjetasActuales.filter((t) => t.id !== id);
        renderizarTarjetas(tarjetasActuales);
        modalContador.textContent = `${tarjetasActuales.length} tarjetas`;
      }
    });
  };

  window.cerrarModalNuevaTarjeta = () =>
    modalNuevaTarjeta.classList.add("hidden");

  // Cerrar modales con fondo o ESC
  window.onclick = function (event) {
    if (event.target == modalBaraja) cerrarModal();
    if (event.target == modalNuevaTarjeta) cerrarModalNuevaTarjeta();
    if (event.target == modalGestionBaraja) cerrarModalGestionBaraja();
    if (event.target == modalEliminar) cancelarEliminar();
  };
});
