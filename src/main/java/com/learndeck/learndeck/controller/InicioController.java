package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.service.BarajaService;
import com.learndeck.learndeck.service.HistorialEstudioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class InicioController {

    @Autowired
    private BarajaService barajaService;

    @Autowired
    private HistorialEstudioService historialService;

    @GetMapping("/inicio")
    public String inicio(HttpSession session, Model model) {

        Long usuarioId=(Long) session.getAttribute("usuarioId");
        String usuarioNombre=(String) session.getAttribute("usuarioNombre");

        if (usuarioId == null) return "redirect:/login";

        List<Baraja> barajas=barajaService.obtenerBarajasPorUsuario(usuarioId);
        List<String> categorias=barajaService.obtenerCategorias(usuarioId);

        model.addAttribute("usuarioNombre", usuarioNombre);
        model.addAttribute("barajas", barajas);
        model.addAttribute("usuarioRol", session.getAttribute("usuarioRol"));
        model.addAttribute("categorias", categorias);

        return "inicio";
    }
}