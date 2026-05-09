"use strict";

// ── Estado de la sesión ──
let indice = 0;
let correctas = 0;
let incorrectas = 0;
let girada = false; // true cuando la tarjeta está volteada

// ── Referencias ──
const escena = document.querySelector("#escena");
const textoPregunta = document.querySelector("#textoPregunta");
const textoRespuesta = document.querySelector("#textoRespuesta");
const numActual = document.querySelector("#numActual");
const barraProgreso = document.querySelector("#barraProgreso");
const botonesResp = document.querySelector("#botonesRespuesta");
const hintVoltear = document.querySelector("#hintVoltear");
const hintTeclado = document.querySelector("#hintTeclado");
const contCorrect = document.querySelector("#contCorrect");
const contIncorrect = document.querySelector("#contIncorrect");

// ── Arranque ──
function iniciar() {
  if (TARJETAS.length === 0) {
    mostrarToast("No hay tarjetas para repasar.", "info");
    mostrarResultado();
    return;
  }
  mostrarTarjeta();
}

function mostrarTarjeta() {
  const t = TARJETAS[indice];

  textoPregunta.textContent = t.pregunta;
  textoRespuesta.textContent = t.respuesta;
  numActual.textContent = indice + 1;

  // Reseteamos la tarjeta al frente
  girada = false;
  escena.classList.remove("girada");
  botonesResp.style.opacity = "0";
  botonesResp.style.pointerEvents = "none";
  hintVoltear.style.opacity = "1";
  hintTeclado.style.opacity = "0";

  barraProgreso.style.width = (indice / TARJETAS.length) * 100 + "%";

  // Reiniciamos la animación de entrada forzando reflow
  escena.style.animation = "none";
  escena.offsetHeight;
  escena.style.animation = "entradaTarjeta 0.35s ease";
}

function voltearTarjeta() {
  if (girada) return;
  girada = true;
  escena.classList.add("girada");
  botonesResp.style.opacity = "1";
  botonesResp.style.pointerEvents = "all";
  hintVoltear.style.opacity = "0";
  hintTeclado.style.opacity = "1";
}

async function responder(esCorrecta) {
  if (!girada) return;

  try {
    await fetch("/repasar/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tarjetaId: TARJETAS[indice].id,
        resultado: esCorrecta,
      }),
    });
  } catch (e) {
    console.error("Error guardando resultado:", e);
  }

  if (esCorrecta) {
    correctas++;
    contCorrect.textContent = correctas;
  } else {
    incorrectas++;
    contIncorrect.textContent = incorrectas;
  }

  indice++;
  if (indice < TARJETAS.length) {
    mostrarTarjeta();
  } else {
    mostrarResultado();
  }
}

function mostrarResultado() {
  barraProgreso.style.width = "100%";

  document.querySelector("#pantallaRepaso").classList.add("oculta");
  document.querySelector("#pantallaResultado").classList.add("visible");

  const total = correctas + incorrectas;
  const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

  document.querySelector("#resCorrect").textContent = correctas;
  document.querySelector("#resIncorrect").textContent = incorrectas;
  document.querySelector("#resPorcentaje").textContent = porcentaje + "%";

  mostrarToast(`Sesión completada — ${porcentaje}% de acierto.`, "info");
}

function reiniciarSesion() {
  indice = correctas = incorrectas = 0;
  contCorrect.textContent = "0";
  contIncorrect.textContent = "0";

  document.querySelector("#pantallaRepaso").classList.remove("oculta");
  document.querySelector("#pantallaResultado").classList.remove("visible");

  mostrarTarjeta();
  mostrarToast("Sesión reiniciada.", "info");
}

// ── Evento delegado ──
document.addEventListener("click", (e) => {
  const accion = e.target.closest("[data-action]")?.dataset.action;
  switch (accion) {
    case "voltear":
      voltearTarjeta();
      break;
    case "correcto":
      responder(true);
      break;
    case "incorrecto":
      responder(false);
      break;
    case "reiniciar":
      reiniciarSesion();
      break;
  }
});

// ── Teclado ──
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && !girada) {
    e.preventDefault();
    voltearTarjeta();
  }
  if (e.key === "ArrowRight" && girada) responder(true);
  if (e.key === "ArrowLeft" && girada) responder(false);
});

iniciar();
