// ── Datos de barajas ──
let barajasEnZona = [];
let modoActual = "repaso";

// ── Referencias ──
const buscador        = document.querySelector("#buscadorBarajas");
const filtroCategoria = document.querySelector("#filtroCategoria");
const zonaDrop        = document.querySelector("#zonaDrop");
const listaBarajas    = document.querySelector("#listaBarajas");
const main            = document.querySelector("main");

// ── Filtros (elemento único → listener directo está bien) ──
buscador.addEventListener("input",  filtrarBarajas);
filtroCategoria.addEventListener("change", filtrarBarajas);

function filtrarBarajas() {
  const texto     = buscador.value.toLowerCase();
  const categoria = filtroCategoria.value.toLowerCase();

  document.querySelectorAll(".baraja-simple").forEach((baraja) => {
    const titulo = baraja.dataset.titulo.toLowerCase();
    const cat    = (baraja.dataset.categoria || "").toLowerCase();

    baraja.style.display =
      titulo.includes(texto) && (!categoria || cat === categoria) ? "" : "none";
  });
}

// ── Contador barajas ──
const todasBarajas = document.querySelectorAll(".baraja-simple");
document.querySelector("#contadorBarajas").textContent = todasBarajas.length;

// ────────────────────────────────────────────
// DELEGACIÓN 1 — Drag sobre #listaBarajas
// Cubre dragstart/dragend de cualquier .baraja-simple
// (incluye las que se añadan dinámicamente)
// ────────────────────────────────────────────
let barajaArrastrada = null;

listaBarajas.addEventListener("dragstart", (e) => {
  const baraja = e.target.closest(".baraja-simple");
  if (!baraja) return;

  barajaArrastrada = baraja;
  setTimeout(() => baraja.classList.add("arrastrando"), 0);
  e.dataTransfer.effectAllowed = "copy";
});

listaBarajas.addEventListener("dragend", (e) => {
  const baraja = e.target.closest(".baraja-simple");
  if (!baraja) return;

  baraja.classList.remove("arrastrando");
  barajaArrastrada = null;
});

// ── Drop zone (elemento único → listeners directos) ──
zonaDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
  zonaDrop.classList.add("drag-over");
});

zonaDrop.addEventListener("dragleave", (e) => {
  if (!zonaDrop.contains(e.relatedTarget)) {
    zonaDrop.classList.remove("drag-over");
  }
});

zonaDrop.addEventListener("drop", (e) => {
  e.preventDefault();
  zonaDrop.classList.remove("drag-over");
  if (!barajaArrastrada) return;

  const { id, titulo, categoria } = barajaArrastrada.dataset;
  if (barajasEnZona.includes(id)) return;

  añadirBarajaAZona(id, titulo, categoria);
  barajaArrastrada.classList.add("en-zona");
});

// ────────────────────────────────────────────
// DELEGACIÓN 2 — Doble click sobre #listaBarajas
// ────────────────────────────────────────────
listaBarajas.addEventListener("dblclick", (e) => {
  const baraja = e.target.closest(".baraja-simple");
  if (!baraja) return;

  const { id, titulo, categoria } = baraja.dataset;

  if (barajasEnZona.includes(id)) {
    quitarDeZona(id);
  } else {
    añadirBarajaAZona(id, titulo, categoria);
    baraja.classList.add("en-zona");
  }
});

// ────────────────────────────────────────────
// DELEGACIÓN 3 — Clicks en <main>
// Cubre: modos, limpiar, empezar y .btn-quitar dinámicos
// ────────────────────────────────────────────
main.addEventListener("click", (e) => {
  // Botones de modo
  if (e.target.closest("#modoRepaso")) { seleccionarModo("repaso"); return; }
  if (e.target.closest("#modoErrores")) { seleccionarModo("errores"); return; }

  // Limpiar
  if (e.target.closest("#btnLimpiar")) { limpiarZona(); return; }

  // Empezar sesión
  if (e.target.closest("#btnEmpezar")) { empezarSesion(); return; }

  // Quitar baraja de la zona (botón creado dinámicamente)
  const btnQuitar = e.target.closest(".btn-quitar");
  if (btnQuitar) {
    const id = btnQuitar.closest(".baraja-en-zona")?.dataset.id;
    if (id) quitarDeZona(id);
  }
});

// ── Helpers ──────────────────────────────────

function añadirBarajaAZona(id, titulo, categoria) {
  if (barajasEnZona.includes(id)) return;

  document.querySelector("#mensajeZona")?.remove();

  const elemento = document.createElement("div");
  elemento.className = "baraja-en-zona";
  elemento.dataset.id = id;
  // El botón ya NO necesita onclick; lo maneja la delegación en main
  elemento.innerHTML = `
    <button class="btn-quitar">✕</button>
    <img class="zona-img" src="/imagenes/baraja.png">
    <div class="zona-footer">
      <div class="zona-nombre">${titulo}</div>
    </div>
  `;

  zonaDrop.appendChild(elemento);
  barajasEnZona.push(id);
  zonaDrop.classList.add("tiene-barajas");
  actualizarUI();
}

function quitarDeZona(id) {
  zonaDrop.querySelector(`[data-id="${id}"]`)?.remove();
  barajasEnZona = barajasEnZona.filter((b) => b !== id);

  document.querySelector(`.baraja-simple[data-id="${id}"]`)
    ?.classList.remove("en-zona");

  if (barajasEnZona.length === 0) {
    zonaDrop.classList.remove("tiene-barajas");
    mostrarMensajeZonaVacia();
  }

  actualizarUI();
}

function limpiarZona() {
  zonaDrop.querySelectorAll(".baraja-en-zona").forEach((el) => el.remove());
  barajasEnZona = [];
  document.querySelectorAll(".baraja-simple.en-zona")
    .forEach((b) => b.classList.remove("en-zona"));

  zonaDrop.classList.remove("tiene-barajas");
  document.querySelector("#mensajeZona")?.remove();
  mostrarMensajeZonaVacia();
  actualizarUI();
}

function mostrarMensajeZonaVacia() {
  if (document.querySelector("#mensajeZona")) return;
  const msg = document.createElement("div");
  msg.className = "zona-vacia";
  msg.id = "mensajeZona";
  msg.innerHTML = `
    <p style="color:#333;">Arrastra las barajas aquí</p>
    <p style="color:#2a2a3a;font-size:0.75rem;margin-top:0.3rem;">
      Las barajas que añadas se estudiarán en esta sesión
    </p>
  `;
  zonaDrop.appendChild(msg);
}

function seleccionarModo(modo) {
  document.querySelector("#modoRepaso").classList.remove("modo-activo");
  document.querySelector("#modoErrores").classList.remove("modo-activo");
  document.querySelector(modo === "repaso" ? "#modoRepaso" : "#modoErrores")
    .classList.add("modo-activo");
  modoActual = modo;
}

function actualizarUI() {
  const cantidad = barajasEnZona.length;
  document.querySelector("#contadorZona").textContent = `${cantidad} seleccionadas`;
  document.querySelector("#btnEmpezar").disabled = cantidad === 0;
}

function empezarSesion() {
  if (barajasEnZona.length === 0) return;
  window.location.href = `/repasar?barajas=${barajasEnZona.join(",")}&modo=${modoActual}`;
}