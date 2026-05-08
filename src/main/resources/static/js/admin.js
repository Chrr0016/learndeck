 const filtroUsuario = document.getElementById('filtroUsuario');
        const filasBarajas = document.querySelectorAll('.baraja-admin-item');
        const contadorBarajas = document.getElementById('contadorBarajasAdmin');

        // Inicializar el contador con el total de barajas
        contadorBarajas.textContent = filasBarajas.length;

        filtroUsuario.addEventListener('change', () => {
            const usuarioSeleccionado = filtroUsuario.value.toLowerCase();
            let visibles = 0;

            filasBarajas.forEach(fila => {
                const propietario = (fila.dataset.usuario || '').toLowerCase();
                const coincide = !usuarioSeleccionado || propietario === usuarioSeleccionado;

                fila.style.display = coincide ? '' : 'none';
                if (coincide) visibles++;
            });

            contadorBarajas.textContent = visibles;
        });