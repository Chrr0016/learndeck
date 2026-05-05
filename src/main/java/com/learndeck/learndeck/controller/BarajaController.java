package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.service.BarajaService;
import com.learndeck.learndeck.service.TarjetaService;
import com.learndeck.learndeck.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequestMapping("/barajas")
public class BarajaController {

    @Autowired
    private BarajaService barajaService;

    @Autowired
    private TarjetaService tarjetaService;

    @Autowired
    private UsuarioService usuarioService;

    // Método auxiliar para obtener el ID del usuario de la sesión
    private Long getUsuarioId(HttpSession session) {
        return (Long) session.getAttribute("usuarioId");
    }

    // Muestra la lista de barajas del usuario
    @GetMapping
    public String listar(HttpSession session, Model model) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        List<Baraja> barajas = barajaService.obtenerBarajasPorUsuario(usuarioId);

        // Usamos el service para obtener las categorías, ya normaliza y elimina duplicados
        List<String> categorias = barajaService.obtenerCategorias(usuarioId);

        model.addAttribute("barajas", barajas);
        model.addAttribute("categorias", categorias);
        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        return "barajas";
    }

    // Muestra el formulario para crear una nueva baraja
    @GetMapping("/nueva")
    public String nuevaBarajaForm(HttpSession session, Model model) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("baraja", new Baraja());
        model.addAttribute("modoEdicion", false);
        return "baraja-form";
    }

    // Procesa el formulario de creación de baraja
    @PostMapping("/nueva")
    public String crearBaraja(@RequestParam String titulo,
                              @RequestParam(required = false) String categoria,
                              HttpSession session) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        Optional<Usuario> usuario = usuarioService.findById(usuarioId);
        if (usuario.isEmpty()) return "redirect:/login";

        barajaService.crear(titulo, categoria, usuario.get());
        return "redirect:/barajas";
    }

    // Muestra el formulario para editar una baraja existente
    @GetMapping("/{id}/editar")
    public String editarBarajaForm(@PathVariable Long id,
                                   HttpSession session,
                                   Model model) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        Optional<Baraja> baraja = barajaService.obtenerPorId(id);

        // Si la baraja no existe o no pertenece al usuario, redirigimos
        if (baraja.isEmpty() || !baraja.get().getUsuario().getId().equals(usuarioId)) {
            return "redirect:/barajas";
        }

        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("baraja", baraja.get());
        model.addAttribute("modoEdicion", true);
        return "baraja-form";
    }

    // Procesa el formulario de edición de baraja
    @PostMapping("/{id}/editar")
    public String editarBaraja(@PathVariable Long id,
                               @RequestParam String titulo,
                               @RequestParam(required = false) String categoria,
                               HttpSession session) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        barajaService.editar(id, titulo, categoria, usuarioId);
        return "redirect:/barajas";
    }

    // Elimina una baraja
    @PostMapping("/{id}/eliminar")
    public String eliminarBaraja(@PathVariable Long id, HttpSession session) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        barajaService.eliminar(id, usuarioId);
        return "redirect:/barajas";
    }

    // Devuelve las tarjetas de una baraja en formato JSON para el modal
    // @ResponseBody indica que el return es JSON, no una vista HTML
    @GetMapping("/{id}/tarjetas/json")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tarjetasJson(@PathVariable Long id,
                                                            HttpSession session) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return ResponseEntity.status(401).build();

        Optional<Baraja> baraja = barajaService.obtenerPorId(id);
        if (baraja.isEmpty() || !baraja.get().getUsuario().getId().equals(usuarioId)) {
            return ResponseEntity.status(403).build();
        }

        List<Tarjeta> tarjetas = tarjetaService.obtenerPorBaraja(id);

        // Convertimos cada tarjeta a un mapa porque el JS no puede leer objetos Java directamente
        List<Map<String, Object>> tarjetasJson = new ArrayList<>();
        for (Tarjeta t : tarjetas) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("pregunta", t.getPregunta());
            map.put("respuesta", t.getRespuesta());
            map.put("nivelDificultad", t.getNivelDificultad());
            tarjetasJson.add(map);
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", baraja.get().getId());
        respuesta.put("titulo", baraja.get().getTitulo());
        respuesta.put("categoria", baraja.get().getCategoria());
        respuesta.put("tarjetas", tarjetasJson);

        return ResponseEntity.ok(respuesta);
    }

    // Muestra el formulario para crear una nueva tarjeta en una baraja
    @GetMapping("/{id}/tarjetas/nueva")
    public String nuevaTarjetaForm(@PathVariable Long id,
                                   HttpSession session,
                                   Model model) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        Optional<Baraja> baraja = barajaService.obtenerPorId(id);
        if (baraja.isEmpty() || !baraja.get().getUsuario().getId().equals(usuarioId)) {
            return "redirect:/barajas";
        }

        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("baraja", baraja.get());
        model.addAttribute("tarjeta", new Tarjeta());
        model.addAttribute("modoEdicion", false);
        return "tarjeta-form";
    }

    // Procesa el formulario de creación de tarjeta
    @PostMapping("/{id}/tarjetas/nueva")
    public String crearTarjeta(@PathVariable Long id,
                               @RequestParam String pregunta,
                               @RequestParam String respuesta,
                               HttpSession session) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";

        Optional<Baraja> baraja = barajaService.obtenerPorId(id);
        if (baraja.isEmpty() || !baraja.get().getUsuario().getId().equals(usuarioId)) {
            return "redirect:/barajas";
        }

        tarjetaService.crear(pregunta, respuesta, baraja.get());
        return "redirect:/barajas";
    }
}