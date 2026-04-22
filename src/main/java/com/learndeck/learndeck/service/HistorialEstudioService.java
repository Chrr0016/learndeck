package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.HistorialEstudio;
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.repository.HistorialEstudioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistorialEstudioService {

    @Autowired
    private HistorialEstudioRepository historialRepository;

    // Guardar resultado de una tarjeta estudiada
    public void guardarResultado(Usuario usuario, Tarjeta tarjeta, boolean resultado) {
        HistorialEstudio historial = new HistorialEstudio();
        historial.setUsuario(usuario);
        historial.setTarjeta(tarjeta);
        historial.setResultado(resultado);
        historial.setFechaEstudio(LocalDateTime.now());
        historialRepository.save(historial);
    }

    // Obtener tarjetas falladas (para revisión de errores)
    public List<HistorialEstudio> obtenerFalladas(Long usuarioId) {
        return historialRepository.findByUsuarioIdAndResultado(usuarioId, false);
    }

    // Calcular estadísticas dinámicamente desde el historial
    public int totalEstudiadas(Long usuarioId) {
        return historialRepository.findByUsuarioId(usuarioId).size();
    }

    public long totalAciertos(Long usuarioId) {
        return historialRepository.findByUsuarioIdAndResultado(usuarioId, true).size();
    }

    public long totalFallos(Long usuarioId) {
        return historialRepository.findByUsuarioIdAndResultado(usuarioId, false).size();
    }

    public double porcentajeAcierto(Long usuarioId) {
        int total = totalEstudiadas(usuarioId);
        if (total == 0) return 0.0;
        return (double) totalAciertos(usuarioId) / total * 100;
    }
}