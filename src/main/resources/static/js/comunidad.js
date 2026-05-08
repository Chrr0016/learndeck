document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. CONTADOR Y FILTROS
  // ==========================================
  const todasBarajas = document.querySelectorAll(".baraja-comunidad");
  const contadorComunidad = document.getElementById("contadorComunidad");
  const filtraNombre = document.getElementById("filtraNombre");
  const filtroCategoria = document.getElementById("filtroCategoria");

  // Inicializamos el contador con el total de barajas
  if (contadorComunidad) {
    contadorComunidad.textContent = todasBarajas.length;
  }

  // Filtra las barajas visibles según nombre y categoría
  function filtrar() {
    const nombre = filtraNombre ? filtraNombre.value.toLowerCase() : "";
    const categoria = filtroCategoria
      ? filtroCategoria.value.toLowerCase()
      : "";

    let visibles = 0;

    todasBarajas.forEach((baraja) => {
      const titulo = (baraja.dataset.titulo || "").toLowerCase();
      const cat = (baraja.dataset.categoria || "").toLowerCase();

      const coincideNombre = titulo.includes(nombre);
      const coincideCategoria = !categoria || cat === categoria;

      const esVisible = coincideNombre && coincideCategoria;
      baraja.style.display = esVisible ? "" : "none";

      if (esVisible) visibles++;
    });

    if (contadorComunidad) {
      contadorComunidad.textContent = visibles;
    }
  }

  if (filtraNombre) filtraNombre.addEventListener("input", filtrar);
  if (filtroCategoria) filtroCategoria.addEventListener("change", filtrar);

  // ==========================================
  // 2. GUARDAR COPIA DE UNA BARAJA
  // ==========================================

  // Guardamos los IDs de las barajas que el usuario ya ha guardado
  // en esta sesión para evitar que pulse guardar dos veces
  const yaGuardadas = new Set();

  window.guardarCopia = async function (id, titulo) {
    if (yaGuardadas.has(id)) {
      mostrarToast("Ya guardaste esta baraja en tu colección.", "info");
      return;
    }

    try {
      const res = await fetch(`/barajas/${id}/guardar-copia`, {
        method: "POST",
      });

      if (res.ok) {
        yaGuardadas.add(id);
        mostrarToast(`"${titulo}" guardada en tu colección.`, "exito");

        // Marcamos la card visualmente para que el usuario sepa que ya la guardó
        const card = document.querySelector(
          `.baraja-comunidad[data-id="${id}"]`,
        );
        if (card) {
          card.style.borderColor = "rgba(74, 222, 128, 0.5)";
          card.style.boxShadow = "0 0 20px rgba(74, 222, 128, 0.1)";
          card.style.cursor = "default";
          card.onclick = () =>
            mostrarToast("Ya guardaste esta baraja en tu colección.", "info");

          // Añadimos un pequeño badge encima del footer
          const footer = card.querySelector(".baraja-gestion-footer");
          if (footer) {
            const badge = document.createElement("div");
            badge.style.cssText = `
                        font-size:0.6rem;
                        color:#4ade80;
                        font-family:var(--font-mono);
                        padding: 2px 6px;
                        background: rgba(74,222,128,0.1);
                        border-top: 1px solid rgba(74,222,128,0.2);
                        text-align: center;
                    `;
            badge.textContent = "✓ guardada";
            card.insertBefore(badge, footer);
          }
        }
      } else if (res.status === 409) {
        mostrarToast("Ya tienes esta baraja en tu colección.", "info");
      } else {
        mostrarToast(
          "Error al guardar la baraja. Inténtalo de nuevo.",
          "error",
        );
      }
    } catch (err) {
      mostrarToast("Error de conexión. Inténtalo de nuevo.", "error");
    }
  };
});
