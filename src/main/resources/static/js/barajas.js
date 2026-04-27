document.addEventListener('DOMContentLoaded', () => {

    // ── Animaciones entrada ──
    const animados = document.querySelectorAll('.animado');
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.1 });
    animados.forEach(el => observador.observe(el));

    // ── Contador inicial ──
    const todasBarajas = document.querySelectorAll('.baraja-gestion');
    const contadorVisible = document.getElementById('contadorVisible');
    if (contadorVisible) contadorVisible.textContent = todasBarajas.length;

    // ── Filtros ──
    const filtraNombre = document.getElementById('filtraNombre');
    const filtroCategoria = document.getElementById('filtroCategoria');

    function filtrar() {
        const nombre = filtraNombre ? filtraNombre.value.toLowerCase() : '';
        const categoria = filtroCategoria ? filtroCategoria.value.toLowerCase() : '';
        let visibles = 0;

        todasBarajas.forEach(baraja => {
            const titulo = (baraja.dataset.titulo || '').toLowerCase();
            const cat = (baraja.dataset.categoria || '').toLowerCase();
            const coincideNombre = titulo.includes(nombre);
            const coincideCategoria = !categoria || cat === categoria;
            const visible = coincideNombre && coincideCategoria;
            baraja.style.display = visible ? '' : 'none';
            if (visible) visibles++;
        });

        if (contadorVisible) contadorVisible.textContent = visibles;
    }

    if (filtraNombre) filtraNombre.addEventListener('input', filtrar);
    if (filtroCategoria) filtroCategoria.addEventListener('change', filtrar);

    // ── Modal baraja ──
    const modalBaraja   = document.getElementById('modalBaraja');
    const modalTitulo   = document.getElementById('modalTitulo');
    const modalMeta     = document.getElementById('modalMeta');
    const modalContador = document.getElementById('modalContador');
    const listaTarjetas = document.getElementById('listaTarjetas');
    const buscarTarjeta = document.getElementById('buscarTarjeta');
    const modalBtnEditar       = document.getElementById('modalBtnEditar');
    const modalBtnNuevaTarjeta = document.getElementById('modalBtnNuevaTarjeta');
    const modalBtnCerrar       = document.getElementById('modalBtnCerrar');

    let tarjetasActuales = [];
    let barajaActualId   = null;

    // Abrir modal con datos de baraja
    window.abrirBaraja = function(id) {
        barajaActualId = id;
        modalBaraja.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Actualizar links
        if (modalBtnEditar)       modalBtnEditar.href       = `/barajas/${id}/editar`;
        if (modalBtnNuevaTarjeta) modalBtnNuevaTarjeta.href = `/barajas/${id}/tarjetas/nueva`;

        // Cargar datos de la baraja via fetch
        listaTarjetas.innerHTML = `
            <div class="text-center py-10" style="color:#333;font-family:'Courier New',monospace;font-size:0.8rem;">
                // cargando_tarjetas()...
            </div>
        `;

        fetch(`/barajas/${id}/tarjetas/json`)
            .then(res => res.json())
            .then(data => {
                tarjetasActuales = data.tarjetas || [];
                modalTitulo.textContent  = data.titulo   || 'Baraja';
                modalMeta.textContent    = `${tarjetasActuales.length} tarjetas · ${data.categoria || 'sin categoría'}`;
                modalContador.textContent = `${tarjetasActuales.length} tarjetas`;
                renderizarTarjetas(tarjetasActuales);
            })
            .catch(() => {
                listaTarjetas.innerHTML = `
                    <div class="text-center py-10" style="color:#f87171;font-family:'Courier New',monospace;font-size:0.8rem;">
                        // error_cargando_tarjetas()
                    </div>
                `;
            });
    };

    // Cerrar modal
    function cerrarModal() {
        modalBaraja.classList.add('hidden');
        document.body.style.overflow = '';
        barajaActualId = null;
        tarjetasActuales = [];
        if (buscarTarjeta) buscarTarjeta.value = '';
    }

    if (modalBtnCerrar) modalBtnCerrar.addEventListener('click', cerrarModal);
    modalBaraja.addEventListener('click', (e) => {
        if (e.target === modalBaraja) cerrarModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });

    // Renderizar tarjetas en el modal
    function renderizarTarjetas(tarjetas) {
        if (tarjetas.length === 0) {
            listaTarjetas.innerHTML = `
                <div class="text-center py-10">
                    <div style="font-size:2rem;margin-bottom:0.75rem;opacity:0.3;">🃏</div>
                    <p style="color:#333;font-family:'Courier New',monospace;font-size:0.8rem;">// no_hay_tarjetas()</p>
                    <p style="color:#2a2a3a;font-size:0.72rem;margin-top:0.3rem;">Crea la primera tarjeta de esta baraja</p>
                </div>
            `;
            return;
        }

        listaTarjetas.innerHTML = tarjetas.map((t, i) => `
            <div class="tarjeta-item" data-id="${t.id}">
                <div class="tarjeta-item-num">${String(i + 1).padStart(2, '0')}</div>
                <div class="tarjeta-item-contenido">
                    <div class="tarjeta-item-pregunta">${t.pregunta}</div>
                    <div class="tarjeta-item-respuesta">${t.respuesta}</div>
                </div>
                <div class="tarjeta-item-acciones">
                    <a href="/tarjetas/${t.id}/editar" class="tarjeta-btn tarjeta-btn-editar" title="Editar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </a>
                    <button onclick="eliminarTarjeta(${t.id})" class="tarjeta-btn tarjeta-btn-eliminar" title="Eliminar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Búsqueda dentro del modal
    if (buscarTarjeta) {
        buscarTarjeta.addEventListener('input', () => {
            const texto = buscarTarjeta.value.toLowerCase();
            const filtradas = tarjetasActuales.filter(t =>
                t.pregunta.toLowerCase().includes(texto) ||
                t.respuesta.toLowerCase().includes(texto)
            );
            renderizarTarjetas(filtradas);
        });
    }

    // Eliminar tarjeta
    window.eliminarTarjeta = function(id) {
        if (!confirm('¿Eliminar esta tarjeta?')) return;

        fetch(`/tarjetas/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    tarjetasActuales = tarjetasActuales.filter(t => t.id !== id);
                    renderizarTarjetas(tarjetasActuales);
                    modalContador.textContent = `${tarjetasActuales.length} tarjetas`;
                    modalMeta.textContent = modalMeta.textContent.replace(/\d+ tarjetas/, `${tarjetasActuales.length} tarjetas`);
                } else {
                    alert('Error al eliminar la tarjeta');
                }
            })
            .catch(() => alert('Error de conexión'));
    };

    // ── Modal eliminar baraja ──
    const modalEliminar = document.getElementById('modalEliminar');
    const formEliminar  = document.getElementById('formEliminar');
    const nombreBarajaEliminar = document.getElementById('nombreBarajaEliminar');

    window.confirmarEliminar = function(id, titulo) {
        nombreBarajaEliminar.textContent = titulo;
        formEliminar.action = `/barajas/${id}/eliminar`;
        modalEliminar.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    window.cancelarEliminar = function() {
        modalEliminar.classList.add('hidden');
        document.body.style.overflow = '';
    };

    modalEliminar.addEventListener('click', (e) => {
        if (e.target === modalEliminar) cancelarEliminar();
    });
});