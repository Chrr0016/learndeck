package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
@RequestMapping("/perfil")
public class PerfilController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public String verPerfil(HttpSession session, Model model) {
        // Buscamos el ID que guardaste en AuthController
        Long id = (Long) session.getAttribute("usuarioId");
        
        if (id == null) {
            return "redirect:/login";
        }

        // Buscamos los datos reales en la BD usando el ID
        Optional<Usuario> usuarioOpt = usuarioService.findById(id);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            model.addAttribute("usuarioNombre", usuario.getNombre());
            model.addAttribute("usuarioEmail", usuario.getEmail());
            model.addAttribute("usuarioRol", usuario.getRol());
            return "perfil";
        }

        return "redirect:/login";
    }

    @PostMapping("/actualizar")
    public String actualizarPerfil(@RequestParam String nombre,
                                   @RequestParam String email,
                                   @RequestParam(required = false) String password,
                                   HttpSession session,
                                   RedirectAttributes redirectAttributes) {
        
        Long id = (Long) session.getAttribute("usuarioId");
        if (id == null) return "redirect:/login";

        boolean exito = usuarioService.actualizarPerfil(id, nombre, email, password);

        if (exito) {
            // ¡IMPORTANTE! Actualizamos el nombre en la sesión 
            // para que el Navbar se actualice sin tener que re-loguear
            session.setAttribute("usuarioNombre", nombre);
            
            redirectAttributes.addFlashAttribute("mensajeExito", "Perfil actualizado correctamente");
        } else {
            redirectAttributes.addFlashAttribute("mensajeError", "Error al actualizar: el email ya existe");
        }

        return "redirect:/perfil";
    }
}