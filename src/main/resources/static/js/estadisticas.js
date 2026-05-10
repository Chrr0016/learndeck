"use strict";

// Esperamos 400ms para que la animación
// de entrada de la página termine primero
window.addEventListener("load", () => {
  setTimeout(() => {

    // Buscamos todas las barras que tienen un data-width definido
    // y les asignamos ese ancho para que se animen con CSS
    document.querySelectorAll(".barra-fill[data-width]").forEach((barra) => {
      barra.style.width=barra.dataset.width + "%";
    });

  }, 400);
});


// Construimos las barras del gráfico
// con los datos que vienen de Thymeleaf
const grafico=document.querySelector("#graficoDias");

// Solo construimos el gráfico si el elemento existe y hay datos
if (grafico && DATOS_SEMANA.length > 0) {

  // Buscamos el valor más alto de la semana para calcular
  // el porcentaje de altura de cada barra
  // Math.max(...array) devuelve el mayor número del array
  // El mínimo es 1 para evitar dividir entre 0
  const maxValor=Math.max(...DATOS_SEMANA.map((d) => d.cantidad), 1);

  DATOS_SEMANA.forEach((dia, indice) => {

    // Calculamos la altura de la barra como porcentaje del máximo
    // Mínimo 3% para que siempre se vea algo aunque sea 0 tarjetas
    const alturaPct=Math.max((dia.cantidad / maxValor) * 100, 3);

    // El último elemento del array es el día de hoy
    const esHoy=indice === DATOS_SEMANA.length - 1;

    // Creamos el elemento div de la barra
    const barra=document.createElement("div");
    barra.className="barra-dia" + (esHoy ? " hoy" : "");
    barra.style.height="0%"; // empieza en 0 y se anima hasta su valor real

    // El tooltip muestra cuántas tarjetas se estudiaron ese día
    barra.innerHTML=`<div class="tooltip">${dia.cantidad} tarjetas</div>`;

    grafico.appendChild(barra);

    // Animamos la barra con un pequeño retraso escalonado
    // cada barra aparece 60ms después que la anterior
    setTimeout(() => {
      barra.style.height=alturaPct + "%";
    }, 400 + indice * 60);
  });
}