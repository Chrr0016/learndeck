package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.BarajaService;
import com.learndeck.learndeck.service.HistorialEstudioService;
import com.learndeck.learndeck.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private BarajaService barajaService;

    @Autowired
    private HistorialEstudioService historialService;

    // Comprueba que hay sesión activa y que el usuario es ADMIN
    private boolean esAdmin(HttpSession session) {
        String rol=(String) session.getAttribute("usuarioRol");
        return "ADMIN".equals(rol);
    }

    // ── Panel principal ──
    @GetMapping
    public String panel(HttpSession session, Model model) {
        if (!esAdmin(session)) return "redirect:/inicio";

        List<Usuario> usuarios=usuarioService.obtenerTodos();
        List<Baraja> barajas  =barajaService.obtenerTodas();

        model.addAttribute("usuarios", usuarios);
        model.addAttribute("barajas", barajas);
        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("usuarioRol", session.getAttribute("usuarioRol"));

        return "admin";
    }

    // ── Eliminar usuario ──
    @PostMapping("/usuarios/{id}/eliminar")
    public String eliminarUsuario(@PathVariable Long id, HttpSession session) {
        if (!esAdmin(session)) return "redirect:/inicio";

        // Un admin no puede eliminarse a sí mismo
        Long adminId=(Long) session.getAttribute("usuarioId");
        if (id.equals(adminId)) return "redirect:/admin";

        usuarioService.eliminar(id);
        return "redirect:/admin";
    }

    // ── Cambiar rol de usuario ──
    @PostMapping("/usuarios/{id}/rol")
    public String cambiarRol(@PathVariable Long id,
                              @RequestParam String rol,
                              HttpSession session) {
        if (!esAdmin(session)) return "redirect:/inicio";

        // Un admin no puede quitarse su propio rol
        Long adminId=(Long) session.getAttribute("usuarioId");
        if (id.equals(adminId)) return "redirect:/admin";

        usuarioService.cambiarRol(id, rol);
        return "redirect:/admin";
    }

    // ── Eliminar baraja (como admin, sin comprobar propietario) ──
    @PostMapping("/barajas/{id}/eliminar")
    public String eliminarBaraja(@PathVariable Long id, HttpSession session) {
        if (!esAdmin(session)) return "redirect:/inicio";

        barajaService.eliminarComoAdmin(id);
        return "redirect:/admin";
    }
}