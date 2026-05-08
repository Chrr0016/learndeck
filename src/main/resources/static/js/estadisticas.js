window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelectorAll('.barra-fill[data-width]').forEach(barra => {
                barra.style.width = barra.dataset.width + '%';
            });
        }, 400);
    });

    // ── Gráfico semanal ──
    const grafico = document.getElementById('graficoDias');
    if (grafico && DATOS_SEMANA.length > 0) {
        const maxVal = Math.max(...DATOS_SEMANA.map(d => d.cantidad), 1);
        const hoy    = new Date().getDay(); // 0 = dom, 1 = lun...

        DATOS_SEMANA.forEach((dia, i) => {
            const pct      = Math.max((dia.cantidad / maxVal) * 100, 3);
            const esHoy    = i === DATOS_SEMANA.length - 1;
            const barraEl  = document.createElement('div');
            barraEl.className = 'barra-dia' + (esHoy ? ' hoy' : '');
            barraEl.style.height = '0%';
            barraEl.innerHTML = `<div class="tooltip">${dia.cantidad} tarjetas</div>`;
            grafico.appendChild(barraEl);

            setTimeout(() => { barraEl.style.height = pct + '%'; }, 400 + i * 60);
        });
    }