package com.learndeck.learndeck.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.BarajaService;
import com.learndeck.learndeck.service.HistorialEstudioService;
import com.learndeck.learndeck.service.TarjetaService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/repaso")
public class RepasoController {

    @Autowired
    private TarjetaService tarjetaService;

    @Autowired
    private BarajaService barajaService;

    @Autowired
    private HistorialEstudioService historialService;

    // ==========================
    // INICIAR REPASO
    // ==========================
    @GetMapping
    public String iniciarRepaso(@RequestParam String barajas,
            Model model,
            HttpSession session) {

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null)
            return "redirect:/login";

        List<Long> ids = Arrays.stream(barajas.split(","))
                .map(Long::parseLong)
                .toList();

        List<Tarjeta> tarjetas = new ArrayList<>();

        for (Long id : ids) {
            tarjetas.addAll(tarjetaService.obtenerPorBaraja(id));
        }

        model.addAttribute("tarjetas", tarjetas);

        return "repaso";
    }

    // ==========================
    // GUARDAR RESPUESTA
    // ==========================
    @PostMapping("/resultado")
    public String guardarResultado(@RequestParam Long tarjetaId,
            @RequestParam boolean acierto,
            HttpSession session) {

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null)
            return "redirect:/login";

        Optional<Tarjeta> tarjeta = tarjetaService.obtenerPorId(tarjetaId);

        if (tarjeta.isPresent()) {
            historialService.guardarResultado(usuario, tarjeta.get(), acierto);
        }

        return "redirect:/repaso/siguiente";
    }

    // ==========================
    // SIGUIENTE (puedes mejorarlo luego con sesión o cola)
    // ==========================
    @GetMapping("/siguiente")
    public String siguiente() {
        return "redirect:/barajas";
    }
}