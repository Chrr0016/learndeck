function validarRegistro() {
  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const contrasenaInput = document.getElementById("contrasena");
  const confirmarInput = document.getElementById("confirmar");
  let valido = true;

  // Validar que el nombre no esté vacío
  const nombreOk = nombreInput.value.trim().length > 0;
  nombreInput.style.borderColor = nombreOk ? "" : "#ef4444";
  document.getElementById("errorNombre").classList.toggle("hidden", nombreOk);
  if (!nombreOk) valido = false;

  // Validar formato email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
  const emailOk = regexEmail.test(emailInput.value);
  emailInput.style.borderColor = emailOk ? "" : "#ef4444";
  document.getElementById("errorEmail").classList.toggle("hidden", emailOk);
  if (!emailOk) valido = false;

  // Mínimo 8 caracteres, una mayúscula y un número
  const regexPass = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const passOk = regexPass.test(contrasenaInput.value);
  contrasenaInput.style.borderColor = passOk ? "" : "#ef4444";
  document.getElementById("errorContrasena").classList.toggle("hidden", passOk);
  if (!passOk) valido = false;

  // Confirmar que ambas contraseñas coinciden
  const coinciden = contrasenaInput.value === confirmarInput.value;
  confirmarInput.style.borderColor = coinciden ? "" : "#ef4444";
  document
    .getElementById("errorConfirmar")
    .classList.toggle("hidden", coinciden);
  if (!coinciden) valido = false;

  if (valido) document.querySelector("form").submit();
}
