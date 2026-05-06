function validarRegistro() {
    const email = document.getElementById('email');
    const contrasena = document.getElementById('contrasena');
    const confirmar = document.getElementById('confirmar');
    let valido = true;

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.value)) {
        email.style.borderColor = '#ef4444';
        document.getElementById('errorEmail').classList.remove('hidden');
        valido = false;
    } else {
        email.style.borderColor = '';
        document.getElementById('errorEmail').classList.add('hidden');
    }

    const regexPass = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPass.test(contrasena.value)) {
        contrasena.style.borderColor = '#ef4444';
        document.getElementById('errorContrasena').classList.remove('hidden');
        valido = false;
    } else {
        contrasena.style.borderColor = '';
        document.getElementById('errorContrasena').classList.add('hidden');
    }

    if (contrasena.value !== confirmar.value) {
        confirmar.style.borderColor = '#ef4444';
        document.getElementById('errorConfirmar').classList.remove('hidden');
        valido = false;
    } else {
        confirmar.style.borderColor = '';
        document.getElementById('errorConfirmar').classList.add('hidden');
    }

    if (valido) document.querySelector('form').submit();
}