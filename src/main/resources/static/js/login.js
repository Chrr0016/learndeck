function validarLogin() {
    const email = document.getElementById('email');
    const contrasena = document.getElementById('contrasena');
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

    if (contrasena.value.length < 8) {
        contrasena.style.borderColor = '#ef4444';
        document.getElementById('errorContrasena').classList.remove('hidden');
        valido = false;
    } else {
        contrasena.style.borderColor = '';
        document.getElementById('errorContrasena').classList.add('hidden');
    }

    if (valido) document.querySelector('form').submit();
}