"use strict";

let barajasEnZona=[];
let modoActual="repaso";

const buscador=document.querySelector("#buscadorBarajas");
const filtroCategoria=document.querySelector("#filtroCategoria");
const zonaDrop=document.querySelector("#zonaDrop");
const listaBarajas=document.querySelector("#listaBarajas");
const main=document.querySelector("main");
const todasBarajas=document.querySelectorAll(".baraja-simple");

document.querySelector("#contadorBarajas").textContent=todasBarajas.length;

// ── Filtros ──
function filtrarBarajas() {
  const texto=buscador.value.toLowerCase();
  const categoria=filtroCategoria.value.toLowerCase();

  todasBarajas.forEach((baraja) => {
    const titulo=baraja.dataset.titulo.toLowerCase();
    const cat=(baraja.dataset.categoria || "").toLowerCase();
    baraja.style.display =
      titulo.includes(texto) && (!categoria || cat === categoria) ? "" : "none";
  });
}

buscador.addEventListener("input", filtrarBarajas);
filtroCategoria.addEventListener("change", filtrarBarajas);

// ── Drag desde lista ──
let barajaArrastrada=null;

listaBarajas.addEventListener("dragstart", (e) => {
  const baraja=e.target.closest(".baraja-simple");
  if (!baraja) return;
  barajaArrastrada=baraja;
  setTimeout(() => baraja.classList.add("arrastrando"), 0);
  e.dataTransfer.effectAllowed="copy";
});

listaBarajas.addEventListener("dragend", (e) => {
  const baraja=e.target.closest(".baraja-simple");
  if (!baraja) return;
  baraja.classList.remove("arrastrando");
  barajaArrastrada=null;
});

// ── Drop zone ──
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

  const { id, titulo, categoria }=barajaArrastrada.dataset;
  if (barajasEnZona.includes(id)) {
    mostrarToast(`"${titulo}" ya está en la zona de estudio.`, "info");
    return;
  }

  añadirBarajaAZona(id, titulo, categoria);
  barajaArrastrada.classList.add("en-zona");
});

// ── Doble click para añadir/quitar ──
listaBarajas.addEventListener("dblclick", (e) => {
  const baraja=e.target.closest(".baraja-simple");
  if (!baraja) return;

  const { id, titulo, categoria }=baraja.dataset;

  if (barajasEnZona.includes(id)) {
    quitarDeZona(id);
  } else {
    añadirBarajaAZona(id, titulo, categoria);
    baraja.classList.add("en-zona");
  }
});

// ── Clicks delegados en <main> ──
main.addEventListener("click", (e) => {
  if (e.target.closest("#modoRepaso")) {
    seleccionarModo("repaso");
    return;
  }
  if (e.target.closest("#modoErrores")) {
    seleccionarModo("errores");
    return;
  }
  if (e.target.closest("#btnLimpiar")) {
    limpiarZona();
    return;
  }
  if (e.target.closest("#btnEmpezar")) {
    empezarSesion();
    return;
  }

  // Botón × de cada baraja en la zona (creado dinámicamente)
  const btnQuitar=e.target.closest(".btn-quitar");
  if (btnQuitar) {
    const id=btnQuitar.closest(".baraja-en-zona")?.dataset.id;
    if (id) quitarDeZona(id);
  }
});

// ── Funciones de zona ──
function añadirBarajaAZona(id, titulo, categoria) {
  if (barajasEnZona.includes(id)) return;

  document.querySelector("#mensajeZona")?.remove();

  const elemento=document.createElement("div");
  elemento.className="baraja-en-zona";
  elemento.dataset.id=id;
  elemento.innerHTML=`
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
  mostrarToast(`"${titulo}" añadida a la sesión.`, "exito");
}

function quitarDeZona(id) {
  const elemento=zonaDrop.querySelector(`[data-id="${id}"]`);
  const nombre =
    elemento?.querySelector(".zona-nombre")?.textContent || "Baraja";
  elemento?.remove();

  barajasEnZona=barajasEnZona.filter((b) => b !== id);
  document
    .querySelector(`.baraja-simple[data-id="${id}"]`)
    ?.classList.remove("en-zona");

  if (barajasEnZona.length === 0) {
    zonaDrop.classList.remove("tiene-barajas");
    mostrarMensajeZonaVacia();
  }

  actualizarUI();
  mostrarToast(`"${nombre}" quitada de la sesión.`, "info");
}

function limpiarZona() {
  if (barajasEnZona.length === 0) return;

  zonaDrop.querySelectorAll(".baraja-en-zona").forEach((el) => el.remove());
  barajasEnZona=[];
  document
    .querySelectorAll(".baraja-simple.en-zona")
    .forEach((b) => b.classList.remove("en-zona"));
  zonaDrop.classList.remove("tiene-barajas");
  mostrarMensajeZonaVacia();
  actualizarUI();
  mostrarToast("Zona de estudio limpiada.", "info");
}

function mostrarMensajeZonaVacia() {
  if (document.querySelector("#mensajeZona")) return;
  const msg=document.createElement("div");
  msg.className="zona-vacia";
  msg.id="mensajeZona";
  msg.innerHTML=`
    <p class="zona-texto-principal">Arrastra las barajas aquí</p>
    <p class="zona-texto-secundario">Las barajas que añadas se estudiarán en esta sesión</p>
  `;
  zonaDrop.appendChild(msg);
}

function seleccionarModo(modo) {
  document.querySelector("#modoRepaso").classList.remove("modo-activo");
  document.querySelector("#modoErrores").classList.remove("modo-activo");
  document
    .querySelector(modo === "repaso" ? "#modoRepaso" : "#modoErrores")
    .classList.add("modo-activo");
  modoActual=modo;
  mostrarToast(
    `Modo: ${modo === "repaso" ? "Repaso normal" : "Solo errores"}.`,
    "info",
  );
}

function actualizarUI() {
  const cantidad=barajasEnZona.length;
  document.querySelector("#contadorZona").textContent =
    `${cantidad} seleccionadas`;
  document.querySelector("#btnEmpezar").disabled=cantidad === 0;
}

function empezarSesion() {
  if (barajasEnZona.length === 0) return;

  // Comprobamos que ninguna baraja de la zona esté vacía
  const barajaVacia=barajasEnZona.find((id) => {
    const el=document.querySelector(`.baraja-simple[data-id="${id}"]`);
    return !el || parseInt(el.dataset.count || "0") === 0;
  });

  if (barajaVacia) {
    const el=document.querySelector(
      `.baraja-simple[data-id="${barajaVacia}"]`,
    );
    const nombre=el?.dataset.titulo || "Una baraja";
    mostrarToast(
      `"${nombre}" no tiene tarjetas. Añade tarjetas antes de estudiar.`,
      "error",
    );
    return;
  }

  window.location.href=`/repasar?barajas=${barajasEnZona.join(",")}&modo=${modoActual}`;
}
