   // ── Estado ──
    let indice = 0;
    let correctas = 0;
    let incorrectas = 0;
    let girada = false;
    let resultados = [];

    const escena         = document.getElementById('escena');
    const textoPregunta  = document.getElementById('textoPregunta');
    const textoRespuesta = document.getElementById('textoRespuesta');
    const numActual      = document.getElementById('numActual');
    const barraProgreso  = document.getElementById('barraProgreso');
    const botonesResp    = document.getElementById('botonesRespuesta');
    const hintVoltear    = document.getElementById('hintVoltear');
    const hintTeclado    = document.getElementById('hintTeclado');
    const contCorrect    = document.getElementById('contCorrect');
    const contIncorrect  = document.getElementById('contIncorrect');

    // ── Iniciar ──
    function iniciar() {
        if (TARJETAS.length === 0) {
            mostrarResultado();
            return;
        }
        mostrarTarjeta();
    }

    function mostrarTarjeta() {
        const t = TARJETAS[indice];
        textoPregunta.textContent  = t.pregunta;
        textoRespuesta.textContent = t.respuesta;
        numActual.textContent      = indice + 1;

        // Resetear estado visual
        girada = false;
        escena.classList.remove('girada');
        botonesResp.style.opacity       = '0';
        botonesResp.style.pointerEvents = 'none';
        hintVoltear.style.opacity       = '1';
        hintTeclado.style.opacity       = '0';

        // Progreso
        const pct = (indice / TARJETAS.length) * 100;
        barraProgreso.style.width = pct + '%';

        // Animación entrada
        escena.style.animation = 'none';
        escena.offsetHeight; // reflow
        escena.style.animation = 'entradaTarjeta 0.35s ease';
    }

    function voltearTarjeta() {
        if (girada) return;
        girada = true;
        escena.classList.add('girada');
        botonesResp.style.opacity       = '1';
        botonesResp.style.pointerEvents = 'all';
        hintVoltear.style.opacity       = '0';
        hintTeclado.style.opacity       = '1';
    }

    async function responder(esCorrecta) {
    // Solo se puede responder si la tarjeta está girada (la respuesta es visible)
    if (!girada) return;

    // Guardamos el resultado en el servidor para las estadísticas
    // Usamos try/catch porque si falla la red, no queremos que se rompa el repaso
    try {
        await fetch('/repasar/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tarjetaId: TARJETAS[indice].id,
                resultado: esCorrecta
            })
        });
    } catch (e) {
        // Si falla el guardado, seguimos el repaso igualmente
        console.error('Error guardando resultado en el servidor:', e);
    }

    // Actualizamos los contadores visuales
    if (esCorrecta) {
        correctas++;
        document.getElementById('contCorrect').textContent = correctas;
    } else {
        incorrectas++;
        document.getElementById('contIncorrect').textContent = incorrectas;
    }

    // Pasamos a la siguiente tarjeta o mostramos el resultado final
    indice++;
    if (indice < TARJETAS.length) {
        mostrarTarjeta();
    } else {
        mostrarResultado();
    }
}

    function mostrarResultado() {
        barraProgreso.style.width = '100%';

        document.getElementById('pantallaRepaso').classList.add('oculta');
        document.getElementById('pantallaResultado').classList.add('visible');

        const total = correctas + incorrectas;
        const pct   = total > 0 ? Math.round((correctas / total) * 100) : 0;

        document.getElementById('resCorrect').textContent   = correctas;
        document.getElementById('resIncorrect').textContent = incorrectas;
        document.getElementById('resPorcentaje').textContent = pct + '%';
    }

    function reiniciarSesion() {
        indice = correctas = incorrectas = 0;
        resultados = [];
        contCorrect.textContent   = '0';
        contIncorrect.textContent = '0';

        document.getElementById('pantallaRepaso').classList.remove('oculta');
        document.getElementById('pantallaResultado').classList.remove('visible');

        mostrarTarjeta();
    }

    // ── Teclado ──
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!girada) voltearTarjeta();
        }
        if (e.key === 'ArrowRight' && girada) responder(true);
        if (e.key === 'ArrowLeft'  && girada) responder(false);
    });

    // ── Arrancar ──
    iniciar();