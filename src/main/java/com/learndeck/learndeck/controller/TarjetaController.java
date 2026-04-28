package com.learndeck.learndeck.controller;
 
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.service.TarjetaService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
 
import java.util.Optional;
 
@Controller
@RequestMapping("/tarjetas")
public class TarjetaController {
 
    @Autowired
    private TarjetaService tarjetaService;
 
    // ── Editar tarjeta — formulario ──
    @GetMapping("/{id}/editar")
    public String editarForm(@PathVariable Long id,
                              HttpSession session,
                              Model model) {
        Long usuarioId = (Long) session.getAttribute("usuarioId");
        if (usuarioId == null) return "redirect:/login";
 
        Optional<Tarjeta> tarjeta = tarjetaService.obtenerPorId(id);
        if (tarjeta.isEmpty()) return "redirect:/barajas";
 
        if (!tarjeta.get().getBaraja().getUsuario().getId().equals(usuarioId)) {
            return "redirect:/barajas";
        }
 
        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("tarjeta", tarjeta.get());
        model.addAttribute("baraja", tarjeta.get().getBaraja());
        model.addAttribute("modoEdicion", true);
        return "tarjeta-form";
    }
 
    // ── Editar tarjeta — guardar ──
    @PostMapping("/{id}/editar")
    public String editar(@PathVariable Long id,
                          @RequestParam String pregunta,
                          @RequestParam String respuesta,
                          HttpSession session) {
        Long usuarioId = (Long) session.getAttribute("usuarioId");
        if (usuarioId == null) return "redirect:/login";
 
        tarjetaService.editar(id, pregunta, respuesta, usuarioId);
        return "redirect:/barajas";
    }
 
    // ── Eliminar tarjeta (via AJAX) ──
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> eliminar(@PathVariable Long id, HttpSession session) {
        Long usuarioId = (Long) session.getAttribute("usuarioId");
        if (usuarioId == null) return ResponseEntity.status(401).build();
 
        boolean ok = tarjetaService.eliminar(id, usuarioId);
        return ok ? ResponseEntity.ok().build() : ResponseEntity.status(403).build();
    }
}