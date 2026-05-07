package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.BarajaService;
import com.learndeck.learndeck.service.HistorialEstudioService;
import com.learndeck.learndeck.service.TarjetaService;
import com.learndeck.learndeck.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.*;

@Controller
@RequestMapping("/repasar")
public class RepasoController {

    @Autowired
    private BarajaService barajaService;

    @Autowired
    private TarjetaService tarjetaService;

    @Autowired
    private HistorialEstudioService historialService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public String iniciarRepaso(@RequestParam(required = false) String barajas,
                                @RequestParam(defaultValue = "repaso") String modo,
                                HttpSession session,
                                Model model, RedirectAttributes redirectAttributes) {

        Long usuarioId = (Long) session.getAttribute("usuarioId");
        if (usuarioId == null) return "redirect:/login";

        if (barajas == null || barajas.isEmpty()) return "redirect:/dashboard";

        // Convertimos el string "4,6,7" en una lista de números [4, 6, 7]
        List<Long> barajaIds = new ArrayList<>();
        for (String idStr : barajas.split(",")) {
            try {
                barajaIds.add(Long.parseLong(idStr.trim()));
            } catch (NumberFormatException e) {
                // Si el ID no es un número válido lo ignoramos
            }
        }

        List<Tarjeta> tarjetas = new ArrayList<>();

        if ("errores".equals(modo)) {
            // Modo errores: solo tarjetas cuyo último intento fue incorrecto
            List<Long> idsFalladas = historialService.obtenerIdsTarjetasFalladasPorBarajas(usuarioId, barajaIds);

            if (idsFalladas.isEmpty()) {
                redirectAttributes.addFlashAttribute("mensajeInfo", "No hay tarjetas con errores en las barajas seleccionadas.");
                return "redirect:/dashboard";
            }

            tarjetas = new ArrayList<>(tarjetaService.obtenerPorIds(idsFalladas));

        } else {
            // Modo repaso: todas las tarjetas de las barajas seleccionadas
            for (Long barajaId : barajaIds) {
                Optional<Baraja> barajaOpt = barajaService.obtenerPorId(barajaId);
                if (barajaOpt.isEmpty()) continue;

                Baraja baraja = barajaOpt.get();

                // Solo añadimos tarjetas de barajas que pertenecen al usuario
                if (baraja.getUsuario().getId().equals(usuarioId)) {
                    tarjetas.addAll(tarjetaService.obtenerPorBaraja(barajaId));
                }
            }
        }

        if (tarjetas.isEmpty()) return "redirect:/dashboard";

        // Mezclamos las tarjetas aleatoriamente para cada sesión
        Collections.shuffle(tarjetas);

        // Convertimos las tarjetas a una lista de mapas para pasarlas al JS
        // No podemos pasar objetos Java directamente al JavaScript
        List<Map<String, Object>> tarjetasJson = new ArrayList<>();
        for (Tarjeta t : tarjetas) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("pregunta", t.getPregunta());
            map.put("respuesta", t.getRespuesta());
            tarjetasJson.add(map);
        }

        model.addAttribute("tarjetas", tarjetas);
        model.addAttribute("tarjetasJson", tarjetasJson);
        model.addAttribute("barajaIds", barajas);
        model.addAttribute("modo", modo);
        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("usuarioRol", session.getAttribute("usuarioRol"));

        return "repaso";
    }

    // Este endpoint lo llama el JavaScript de la página de repaso con fetch()
    // cada vez que el usuario responde una tarjeta
    // @ResponseBody indica que el return es JSON, no una vista HTML
    @PostMapping("/guardar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> guardarResultado(
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        Long usuarioId = (Long) session.getAttribute("usuarioId");
        if (usuarioId == null) return ResponseEntity.status(401).build();

        try {
            Long tarjetaId = ((Number) body.get("tarjetaId")).longValue();
            boolean resultado = (Boolean) body.get("resultado");

            Optional<Usuario> usuario = usuarioService.findById(usuarioId);
            if (usuario.isEmpty()) return ResponseEntity.status(401).build();

            Optional<Tarjeta> tarjeta = tarjetaService.obtenerPorId(tarjetaId);
            if (tarjeta.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tarjeta no encontrada"));
            }

            historialService.guardarResultado(usuario.get(), tarjeta.get(), resultado);
            return ResponseEntity.ok(Map.of("ok", true));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}