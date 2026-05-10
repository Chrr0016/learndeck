"use strict";

function validarLogin() {
  const emailInput=document.querySelector("#email");
  const contrasenaInput=document.querySelector("#contrasena");
  let valido=true;

  // Validar formato de email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
  
  const emailOk=regexEmail.test(emailInput.value);
  
  emailInput.style.borderColor=emailOk ? "" : "#ef4444";
  
  document.querySelector("#errorEmail").classList.toggle("hidden", emailOk);
  
  if (!emailOk) valido=false;

  // Validar longitud mínima de contraseña
  const regexPass = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const passOk = regexPass.test(contrasenaInput.value);

  contrasenaInput.style.borderColor=passOk ? "" : "#ef4444";

  document.querySelector("#errorContrasena").classList.toggle("hidden", passOk);
  
  if (!passOk) valido=false;

  if (valido) document.querySelector("form").submit();
}