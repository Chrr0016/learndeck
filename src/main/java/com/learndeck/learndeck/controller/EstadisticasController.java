package com.learndeck.learndeck.controller;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.HistorialEstudio;
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.service.BarajaService;
import com.learndeck.learndeck.service.HistorialEstudioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;
import java.util.*;

@Controller
@RequestMapping("/estadisticas")
public class EstadisticasController {

    @Autowired
    private HistorialEstudioService historialService;

    @Autowired
    private BarajaService barajaService;

    @GetMapping
    public String estadisticas(HttpSession session, Model model) {

        Long usuarioId = (Long) session.getAttribute("usuarioId");
        if (usuarioId == null)
            return "redirect:/login";

        List<HistorialEstudio> historial = historialService.obtenerTodo(usuarioId);

        // ── Stats globales ──
        long totalEstudiadas = historial.size();
        long totalAciertos = 0;
        for (HistorialEstudio h : historial) {
            if (h.getResultado())
                totalAciertos++;
        }
        long totalFallos = totalEstudiadas - totalAciertos;
        int porcentaje = totalEstudiadas > 0 ? (int) Math.round((double) totalAciertos / totalEstudiadas * 100)
                : 0;

        // ── Actividad últimos 7 días ──
        String[] nombresDias = { "L", "M", "X", "J", "V", "S", "D" };
        List<Map<String, Object>> datosSemana = new ArrayList<>();
        List<String> diasSemana = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate dia = hoy.minusDays(i);

            // Contamos cuántas tarjetas se estudiaron ese día
            long cantidad = 0;
            for (HistorialEstudio h : historial) {
                if (h.getFechaEstudio() != null &&
                        h.getFechaEstudio().toLocalDate().equals(dia)) {
                    cantidad++;
                }
            }

            Map<String, Object> datosDia = new HashMap<>();
            datosDia.put("cantidad", cantidad);
            datosDia.put("fecha", dia.toString());
            datosSemana.add(datosDia);

            // getDayOfWeek().getValue() devuelve 1=Lunes ... 7=Domingo
            int indiceDia = dia.getDayOfWeek().getValue() - 1;
            diasSemana.add(nombresDias[indiceDia]);
        }

        long totalSemana = 0;
        for (Map<String, Object> dia : datosSemana) {
            totalSemana += ((Number) dia.get("cantidad")).longValue();
        }

        // ── Estadísticas por baraja ──
        List<Baraja> barajas = barajaService.obtenerBarajasPorUsuario(usuarioId);
        List<Map<String, Object>> estadisticasPorBaraja = new ArrayList<>();

        for (Baraja baraja : barajas) {
            // Filtramos el historial que corresponde a esta baraja
            List<HistorialEstudio> historialBaraja = new ArrayList<>();
            for (HistorialEstudio h : historial) {
                if (h.getTarjeta() != null &&
                        h.getTarjeta().getBaraja() != null &&
                        h.getTarjeta().getBaraja().getId().equals(baraja.getId())) {
                    historialBaraja.add(h);
                }
            }

            if (historialBaraja.isEmpty())
                continue;

            long aciertosBaraja = 0;
            for (HistorialEstudio h : historialBaraja) {
                if (h.getResultado())
                    aciertosBaraja++;
            }
            long fallosBaraja = historialBaraja.size() - aciertosBaraja;
            int pctBaraja = (int) Math.round((double) aciertosBaraja / historialBaraja.size() * 100);

            Map<String, Object> est = new LinkedHashMap<>();
            est.put("titulo", baraja.getTitulo());
            est.put("total", historialBaraja.size());
            est.put("aciertos", aciertosBaraja);
            est.put("fallos", fallosBaraja);
            est.put("porcentaje", pctBaraja);
            estadisticasPorBaraja.add(est);
        }

        // Ordenamos de mayor a menor número de tarjetas estudiadas
        estadisticasPorBaraja.sort(new Comparator<Map<String, Object>>() {
            @Override
            public int compare(Map<String, Object> a, Map<String, Object> b) {
                Integer totalA = (Integer) a.get("total");
                Integer totalB = (Integer) b.get("total");
                // Orden descendente
                return totalB.compareTo(totalA);
            }
        });

        // ── Top 5 tarjetas más falladas ──
        // Contamos los fallos de cada tarjeta usando su ID como clave
        Map<Long, Long> fallosPorTarjeta = new HashMap<>();
        Map<Long, Tarjeta> tarjetasPorId = new HashMap<>();

        for (HistorialEstudio h : historial) {
            if (h.getResultado() || h.getTarjeta() == null)
                continue;
            Long tarjetaId = h.getTarjeta().getId();
            fallosPorTarjeta.put(tarjetaId, fallosPorTarjeta.getOrDefault(tarjetaId, 0L) + 1);
            tarjetasPorId.put(tarjetaId, h.getTarjeta());
        }

        // Convertimos el mapa a lista y ordenamos por número de fallos
        List<Map.Entry<Long, Long>> entradasOrdenadas = new ArrayList<>(fallosPorTarjeta.entrySet());
        entradasOrdenadas.sort(new Comparator<Map.Entry<Long, Long>>() {
            @Override
            public int compare(Map.Entry<Long, Long> a, Map.Entry<Long, Long> b) {
                // Orden descendente: el que más fallos tiene primero
                return Long.compare(b.getValue(), a.getValue());
            }
        });

        List<Map<String, Object>> tarjetasDificiles = new ArrayList<>();
        int totalTarjetasFalladas = entradasOrdenadas.size();
        int maximoAMostrar = 5;
        int limite = Math.min(maximoAMostrar, totalTarjetasFalladas);

        for (int i = 0; i < limite; i++) {
            Map.Entry<Long, Long> entrada = entradasOrdenadas.get(i);
            Tarjeta tarjeta = tarjetasPorId.get(entrada.getKey());

            Map<String, Object> td = new LinkedHashMap<>();
            td.put("pregunta", tarjeta.getPregunta());
            td.put("baraja", tarjeta.getBaraja() != null ? tarjeta.getBaraja().getTitulo() : "");
            td.put("fallos", entrada.getValue());
            tarjetasDificiles.add(td);
        }

        model.addAttribute("usuarioNombre", session.getAttribute("usuarioNombre"));
        model.addAttribute("totalEstudiadas", totalEstudiadas);
        model.addAttribute("totalAciertos", totalAciertos);
        model.addAttribute("totalFallos", totalFallos);
        model.addAttribute("porcentaje", porcentaje);
        model.addAttribute("datosSemana", datosSemana);
        model.addAttribute("diasSemana", diasSemana);
        model.addAttribute("totalSemana", totalSemana);
        model.addAttribute("estadisticasPorBaraja", estadisticasPorBaraja);
        model.addAttribute("tarjetasDificiles", tarjetasDificiles);
        model.addAttribute("usuarioRol", session.getAttribute("usuarioRol"));

        return "estadisticas";
    }
}