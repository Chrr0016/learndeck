package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

/**
 * Gestiona el flujo de autenticación: registro, login y logout.
 * Las validaciones se hacen aquí antes de llamar al servicio
 * para evitar peticiones innecesarias a base de datos con datos inválidos.
 */
@Controller
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/login")
    public String mostrarLogin() {
        return "login";
    }

    // Guardamos en sesión solo los datos que necesitamos en las vistas
    // para no exponer el objeto Usuario completo (que incluye el hash de
    // contraseña).
    @PostMapping("/login")
    public String procesarLogin(@RequestParam String email,
            @RequestParam String contrasena,
            HttpSession session,
            Model model) {

        /*
         * if (!email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$")) {
         * model.addAttribute("error", "El formato del correo no es válido.");
         * return "login";
         * }
         * 
         * if (contrasena.length() < 8) {
         * model.addAttribute("error",
         * "La contraseña debe tener al menos 8 caracteres.");
         * return "login";
         * }
         */

        Optional<Usuario> usuario = usuarioService.login(email, contrasena);

        if (usuario.isPresent()) {
            session.setAttribute("usuarioId", usuario.get().getId());
            session.setAttribute("usuarioNombre", usuario.get().getNombre());
            session.setAttribute("usuarioRol", usuario.get().getRol());
            return "redirect:/inicio";
        }

        model.addAttribute("error", "Email o contraseña incorrectos.");
        return "login";
    }

    // Mostrar registro
    @GetMapping("/registro")
    public String mostrarRegistro() {
        return "registro";
    }

    // El frontend (registro.js) ya las comprueba, pero validamos aquí también
    // porque cualquiera puede enviar una petición POST sin pasar por el formulario.
    @PostMapping("/registro")
    public String procesarRegistro(@RequestParam String nombre,
            @RequestParam String email,
            @RequestParam String contrasena,
            @RequestParam(required = false) String confirmar,
            Model model, RedirectAttributes redirectAttributes) {

        // Formato email
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")) {
            model.addAttribute("error", "El formato del correo no es válido.");
            return "registro";
        }

        // Contraseña: mínimo 8 chars, 1 mayúscula, 1 número
        if (!contrasena.matches("^(?=.*[A-Z])(?=.*\\d).{8,}$")) {
            model.addAttribute("error", "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
            return "registro";
        }

        // Confirmar contraseña
        if (confirmar == null || !contrasena.equals(confirmar)) {
            model.addAttribute("error", "Las contraseñas no coinciden.");
            return "registro";
        }

        boolean exito = usuarioService.registrar(nombre, email, contrasena);

        if (exito) {
            redirectAttributes.addFlashAttribute("mensajeExito", "Cuenta creada correctamente.");
            return "redirect:/login";
        }

        model.addAttribute("error", "El correo ya está en uso.");
        return "registro";
    }

    // Cerrar sesión
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        // session.invalidate() destruye la sesión del servidor y borra la cookie JSESSIONID,
        // por lo que el usuario no puede volver a páginas protegidas con el botón atrás.
        session.invalidate();
        return "redirect:/login";
    }
}