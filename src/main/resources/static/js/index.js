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