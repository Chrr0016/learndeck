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
import java.util.stream.Collectors;
 
@Controller
@RequestMapping("/barajas")
public class BarajaController {
 
    @Autowired
    private BarajaService barajaService;
 
    @Autowired
    private TarjetaService tarjetaService;
 
    @Autowired
    private UsuarioService usuarioService;
 
    // ── Comprobar sesión ──
    private Long getUsuarioId(HttpSession session) {
        return (Long) session.getAttribute("usuarioId");
    }
 
    // ── Listar todas las barajas ──
    @GetMapping
    public String listar(HttpSession session, Model model) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";
 
        List<Baraja> barajas = barajaService.obtenerBarajasPorUsuario(usuarioId);
 
        List<String> categorias = barajas.stream()
                .map(Baraja::getCategoria)
                .filter(c -> c != null && !c.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
 
        model.addAttribute("barajas", barajas);
        model.addAttribute("categorias", categorias);
        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        return "barajas";
    }
 
    // ── Mostrar formulario nueva baraja ──
    @GetMapping("/nueva")
    public String nuevaBarajaForm(HttpSession session, Model model) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";
 
        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("baraja", new Baraja());
        model.addAttribute("modoEdicion", false);
        return "baraja-form";
    }
 
    // ── Crear baraja ──
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
 
    // ── Mostrar formulario editar baraja ──
    @GetMapping("/{id}/editar")
    public String editarBarajaForm(@PathVariable Long id,
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
        model.addAttribute("modoEdicion", true);
        return "baraja-form";
    }
 
    // ── Editar baraja ──
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
 
    // ── Eliminar baraja ──
    @PostMapping("/{id}/eliminar")
    public String eliminarBaraja(@PathVariable Long id, HttpSession session) {
        Long usuarioId = getUsuarioId(session);
        if (usuarioId == null) return "redirect:/login";
 
        barajaService.eliminar(id, usuarioId);
        return "redirect:/barajas";
    }
 
    // ── API JSON — Tarjetas de una baraja (para el modal) ──
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
 
        List<Map<String, Object>> tarjetasJson = tarjetas.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("pregunta", t.getPregunta());
            map.put("respuesta", t.getRespuesta());
            map.put("nivelDificultad", t.getNivelDificultad());
            return map;
        }).collect(Collectors.toList());
 
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", baraja.get().getId());
        respuesta.put("titulo", baraja.get().getTitulo());
        respuesta.put("categoria", baraja.get().getCategoria());
        respuesta.put("tarjetas", tarjetasJson);
 
        return ResponseEntity.ok(respuesta);
    }
 
    // ── Mostrar formulario nueva tarjeta ──
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
 
    // ── Crear tarjeta ──
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