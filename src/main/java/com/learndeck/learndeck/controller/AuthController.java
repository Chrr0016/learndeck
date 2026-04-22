package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;


    @GetMapping("/")
    public String landing() {
        return "index";
    }
    // Mostrar login
    @GetMapping("/login")
    public String mostrarLogin() {
        return "login";
    }

    // Procesar login
    @PostMapping("/login")
    public String procesarLogin(@RequestParam String email,
                                @RequestParam String contrasena,
                                HttpSession session,
                                Model model) {

        Optional<Usuario> usuario = usuarioService.login(email, contrasena);

        if (usuario.isPresent()) {
            session.setAttribute("usuarioId", usuario.get().getId());
            session.setAttribute("usuarioNombre", usuario.get().getNombre());
            return "redirect:/dashboard";
        }

        model.addAttribute("error", "Email o contraseña incorrectos");
        return "login";
    }

    // Mostrar registro
    @GetMapping("/registro")
    public String mostrarRegistro() {
        return "registro";
    }

    // Procesar registro
    @PostMapping("/registro")
    public String procesarRegistro(@RequestParam String nombre,
                                   @RequestParam String email,
                                   @RequestParam String contrasena,
                                   Model model) {

        boolean exito = usuarioService.registrar(nombre, email, contrasena);

        if (exito) {
            return "redirect:/login?mensaje=Cuenta creada correctamente";
        }

        model.addAttribute("error", "El correo ya está en uso");
        return "registro";
    }

    // Cerrar sesión
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}