"use strict";

const elementosAnimados=document.querySelectorAll(".animado, .fade-izquierda, .fade-derecha");

const observador=new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

elementosAnimados.forEach((el) => observador.observe(el));

// FAQ — abre/cierra la respuesta al pulsar la pregunta
document.querySelectorAll(".faq-boton").forEach((boton) => {
  boton.addEventListener("click", () => {
    const item=boton.closest(".faq-item");
    const respuesta=item.querySelector(".faq-respuesta");
    const estaAbierto=item.classList.contains("abierto");

    // Cerramos todos antes de abrir el nuevo
    document.querySelectorAll(".faq-item").forEach((i) => {
      i.classList.remove("abierto");
      i.querySelector(".faq-respuesta").classList.remove("abierta");
    });

    if (!estaAbierto) {
      item.classList.add("abierto");
      respuesta.classList.add("abierta");
    }
  });
});