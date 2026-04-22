const tarjetas = document.querySelectorAll('.tarjeta');
const contenedorPuntos = document.querySelector('#puntos');
const btnAnterior = document.querySelector('#anterior');
const btnSiguiente = document.querySelector('#siguiente');
let actual = 0;

// Crear puntos
tarjetas.forEach((_, i) => {
    const punto = document.createElement('button');
    punto.style.cssText = `
        height: 8px;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        transition: all 0.3s;
        background-color: ${i === 0 ? '#a78bfa' : 'rgba(255,255,255,0.2)'};
        width: ${i === 0 ? '16px' : '8px'};
    `;
    punto.addEventListener('click', () => irA(i));
    contenedorPuntos.appendChild(punto);
});

function actualizarPuntos() {
    contenedorPuntos.querySelectorAll('button').forEach((punto, i) => {
        punto.style.backgroundColor = i === actual ? '#a78bfa' : 'rgba(255,255,255,0.2)';
        punto.style.width = i === actual ? '16px' : '8px';
    });
}

function irA(indice) {
    tarjetas[actual].classList.remove('activa', 'girada');
    actual = (indice + tarjetas.length) % tarjetas.length;
    tarjetas[actual].classList.add('activa');
    actualizarPuntos();
}

// Flip al hacer clic
tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('click', () => tarjeta.classList.toggle('girada'));
});

btnAnterior.addEventListener('click', (e) => {
    e.stopPropagation();
    irA(actual - 1);
});

btnSiguiente.addEventListener('click', (e) => {
    e.stopPropagation();
    irA(actual + 1);
});

// Iniciar
irA(0);


/////////////////////////////
//COMO FUNCIONA
////////////////////////////
// ── Animaciones de entrada al hacer scroll ──
const elementosAnimados = document.querySelectorAll('.animado, .fade-izquierda, .fade-derecha');
const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
            observador.unobserve(entrada.target);
        }
    });
}, { threshold: 0.15 });
elementosAnimados.forEach(el => observador.observe(el));

// ── FAQ acordeón ──
document.querySelectorAll('.faq-boton').forEach(boton => {
    boton.addEventListener('click', () => {
        const item = boton.closest('.faq-item');
        const respuesta = item.querySelector('.faq-respuesta');
        const estaAbierto = item.classList.contains('abierto');

        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('abierto');
            i.querySelector('.faq-respuesta').classList.remove('abierta');
        });

        if (!estaAbierto) {
            item.classList.add('abierto');
            respuesta.classList.add('abierta');
        }
    });
});

// ── Efecto 3D hover en tarjetas ──
const angulosPorZona = [
    { x:  10, y: -10 },  // zona 1 — arriba izquierda
    { x:  10, y:   0 },  // zona 2 — arriba centro
    { x:  10, y:  10 },  // zona 3 — arriba derecha
    { x:   0, y: -10 },  // zona 4 — medio izquierda
    { x:   0, y:   0 },  // zona 5 — centro
    { x:   0, y:  10 },  // zona 6 — medio derecha
    { x: -10, y: -10 },  // zona 7 — abajo izquierda
    { x: -10, y:   0 },  // zona 8 — abajo centro
    { x: -10, y:  10 },  // zona 9 — abajo derecha
];

document.querySelectorAll('.tarjeta-frente, .tarjeta-reverso').forEach(lado => {
    const zonas = lado.querySelectorAll('.zona-hover');

    zonas.forEach((zona, i) => {
        zona.addEventListener('mouseenter', () => {
            const { x, y } = angulosPorZona[i];
            lado.style.transform = `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(1.04)`;
        });

        zona.addEventListener('mouseleave', () => {
            lado.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
});


