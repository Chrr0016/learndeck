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
public class DashboardController {

    @Autowired
    private BarajaService barajaService;

    @Autowired
    private HistorialEstudioService historialService;

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {

        // Comprobamos que hay sesión activa
        Long usuarioId = (Long) session.getAttribute("usuarioId");
        String usuarioNombre = (String) session.getAttribute("usuarioNombre");

        if (usuarioId == null) {
            return "redirect:/login";
        }

        // Barajas del usuario
        List<Baraja> barajas = barajaService.obtenerBarajasPorUsuario(usuarioId);

        // Estadísticas calculadas desde historial
        int totalEstudiadas = historialService.totalEstudiadas(usuarioId);
        long totalAciertos = historialService.totalAciertos(usuarioId);
        long totalFallos = historialService.totalFallos(usuarioId);
        double porcentaje = historialService.porcentajeAcierto(usuarioId);

        // Pasamos datos a la vista
        model.addAttribute("usuarioNombre", usuarioNombre);
        model.addAttribute("barajas", barajas);
        model.addAttribute("totalBarajas", barajas.size());
        model.addAttribute("totalEstudiadas", totalEstudiadas);
        model.addAttribute("totalAciertos", totalAciertos);
        model.addAttribute("totalFallos", totalFallos);
        model.addAttribute("porcentaje", String.format("%.0f", porcentaje));

        return "dashboard";
    }
}