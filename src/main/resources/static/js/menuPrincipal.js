
// ── Datos de barajas ──
const barajasEnZona = new Map();
let modoActual = 'repaso';

// ── Animaciones entrada ──
const animados = document.querySelectorAll('.animado');
const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
            observador.unobserve(entrada.target);
        }
    });
}, {threshold: 0.1});
animados.forEach(el => observador.observe(el));

const buscador = document.getElementById('buscadorBarajas');
const filtroCategoria = document.getElementById('filtroCategoria');

buscador.addEventListener('input', filtrarBarajas);
filtroCategoria.addEventListener('change', filtrarBarajas);

function filtrarBarajas() {
    const texto = buscador.value.toLowerCase();
    const categoria = filtroCategoria.value;

    document.querySelectorAll('.baraja-simple').forEach(baraja => {
        const titulo = baraja.dataset.titulo.toLowerCase();
        const cat = baraja.dataset.categoria;

        const coincideTexto = titulo.includes(texto);
        const coincideCategoria = !categoria || cat === categoria;

        if (coincideTexto && coincideCategoria) {
            baraja.style.display = '';
        } else {
            baraja.style.display = 'none';
        }
    });
}


// ── Contador barajas ──
const todasBarajas = document.querySelectorAll('.baraja-simple');
document.getElementById('contadorBarajas').textContent = todasBarajas.length;

// ── Drag & Drop ──
const zonaDrop = document.getElementById('zonaDrop');
let barajaArrastrada = null;

todasBarajas.forEach(baraja => {
    baraja.addEventListener('dragstart', (e) => {
        barajaArrastrada = baraja;
        setTimeout(() => baraja.classList.add('arrastrando'), 0);
        e.dataTransfer.effectAllowed = 'copy';
    });

    baraja.addEventListener('dragend', () => {
        baraja.classList.remove('arrastrando');
        barajaArrastrada = null;
    });
});

zonaDrop.addEventListener('dragover', (e) => {
    e.preventDefault();
    zonaDrop.classList.add('drag-over');
});

zonaDrop.addEventListener('dragleave', (e) => {
    if (!zonaDrop.contains(e.relatedTarget)) {
        zonaDrop.classList.remove('drag-over');
    }
});

zonaDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    zonaDrop.classList.remove('drag-over');

    if (!barajaArrastrada) return;

    const id = barajaArrastrada.dataset.id;
    if (barajasEnZona.has(id)) return;

    const titulo = barajaArrastrada.dataset.titulo;
    const categoria = barajaArrastrada.dataset.categoria;

    añadirBarajaAZona(id, titulo, categoria);
    barajaArrastrada.classList.add('en-zona');
});

function añadirBarajaAZona(id, titulo, categoria) {
    if (barajasEnZona.has(id)) return;

    const mensajeZona = document.getElementById('mensajeZona');
    if (mensajeZona) mensajeZona.remove();

    const elemento = document.createElement('div');
    elemento.className = 'baraja-en-zona';
    elemento.dataset.id = id;
    elemento.innerHTML = `
                                <button class="btn-quitar" onclick="quitarDeZona('${id}')">✕</button>
                                <img src="/imagenes/baraja.png">
                                <div class="overlay-mini">
                                    <div>${titulo}</div>
                                </div>
                            `;

    zonaDrop.appendChild(elemento);
    barajasEnZona.set(id, {titulo, categoria});
    zonaDrop.classList.add('tiene-barajas');

    actualizarUI();
}




function quitarDeZona(id) {
    const elemento = zonaDrop.querySelector(`[data-id="${id}"]`);
    if (elemento) elemento.remove();
    barajasEnZona.delete(id);

    const baraja = document.querySelector(`.baraja-simple[data-id="${id}"]`);
    if (baraja) baraja.classList.remove('en-zona');

    if (barajasEnZona.size === 0) {
        zonaDrop.classList.remove('tiene-barajas');
        const msg = document.createElement('div');
        msg.className = 'zona-vacia';
        msg.id = 'mensajeZona';
        msg.innerHTML = `
                <div style="font-size:2rem;margin-bottom:0.75rem;opacity:0.3;">⬇️</div>
                <p style="color:#333;font-family:'Courier New',monospace;font-size:0.82rem;">// arrastrar_barajas_aquí()</p>
                <p style="color:#2a2a3a;font-size:0.75rem;margin-top:0.3rem;">Las barajas que añadas se estudiarán en esta sesión</p>
            `;
        zonaDrop.appendChild(msg);
    }

    actualizarUI();
}

function limpiarZona() {
    const elementos = zonaDrop.querySelectorAll('.baraja-en-zona');
    elementos.forEach(el => el.remove());
    barajasEnZona.clear();
    document.querySelectorAll('.baraja-simple.en-zona').forEach(b => b.classList.remove('en-zona'));
    zonaDrop.classList.remove('tiene-barajas');

    const msg = document.createElement('div');
    msg.className = 'zona-vacia';
    msg.id = 'mensajeZona';
    msg.innerHTML = `
            <div style="font-size:2rem;margin-bottom:0.75rem;opacity:0.3;">⬇️</div>
            <p style="color:#333;font-family:'Courier New',monospace;font-size:0.82rem;">// arrastrar_barajas_aquí()</p>
            <p style="color:#2a2a3a;font-size:0.75rem;margin-top:0.3rem;">Las barajas que añadas se estudiarán en esta sesión</p>
        `;
    zonaDrop.appendChild(msg);

    actualizarUI();
}

function seleccionarModo(modo) {
    modoActual = modo;
    document.getElementById('modoRepaso').style.cssText = modo === 'repaso'
        ? 'font-size:0.75rem;padding:0.4rem 0.9rem;border-radius:8px;border:1px solid rgba(124,58,237,0.4);background:rgba(124,58,237,0.15);color:var(--violeta-claro);cursor:pointer;font-family:Courier New,monospace;transition:all 0.2s;'
        : 'font-size:0.75rem;padding:0.4rem 0.9rem;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:transparent;color:#555;cursor:pointer;font-family:Courier New,monospace;transition:all 0.2s;';
    document.getElementById('modoErrores').style.cssText = modo === 'errores'
        ? 'font-size:0.75rem;padding:0.4rem 0.9rem;border-radius:8px;border:1px solid rgba(124,58,237,0.4);background:rgba(124,58,237,0.15);color:var(--violeta-claro);cursor:pointer;font-family:Courier New,monospace;transition:all 0.2s;'
        : 'font-size:0.75rem;padding:0.4rem 0.9rem;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:transparent;color:#555;cursor:pointer;font-family:Courier New,monospace;transition:all 0.2s;';
}

function actualizarUI() {
    const cantidad = barajasEnZona.size;
    document.getElementById('contadorZona').textContent = cantidad + ' seleccionadas';
    document.getElementById('totalTarjetas').textContent = cantidad * 10 + ' aprox.';
    const btn = document.getElementById('btnEmpezar');
    btn.disabled = cantidad === 0;
}

function empezarSesion() {
    if (barajasEnZona.size === 0) return;
    const ids = Array.from(barajasEnZona.keys()).join(',');
    window.location.href = `/repasar?barajas=${ids}&modo=${modoActual}`;
}

// ── Click en baraja (además de drag) para añadir ──
todasBarajas.forEach(baraja => {
    baraja.addEventListener('dblclick', () => {
        const id = baraja.dataset.id;
        if (barajasEnZona.has(id)) {
            quitarDeZona(id);
        } else {
            añadirBarajaAZona(
                id,
                baraja.dataset.titulo,
                baraja.dataset.categoria,
            );
            baraja.classList.add('en-zona');
        }
    });
});