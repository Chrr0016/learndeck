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

    public void guardarResultado(Usuario usuario, Tarjeta tarjeta, boolean resultado) {
        HistorialEstudio historial = new HistorialEstudio();
        historial.setUsuario(usuario);
        historial.setTarjeta(tarjeta);
        historial.setResultado(resultado);
        historial.setFechaEstudio(LocalDateTime.now());
        historialRepository.save(historial);
    }

    public List<HistorialEstudio> obtenerTodo(Long usuarioId) {
        return historialRepository.findByUsuarioId(usuarioId);
    }

    // Los tres métodos siguientes hacen una sola consulta a BD cada uno.
    // Se podría optimizar haciendo una sola consulta y calculando los tres valores,
    // pero así es más claro de leer y para el volumen de datos de esta app no supone problema.
    public int totalEstudiadas(Long usuarioId) {
        List<HistorialEstudio> historial = historialRepository.findByUsuarioId(usuarioId);
        return historial.size();
    }

    public long totalAciertos(Long usuarioId) {
        List<HistorialEstudio> historial = historialRepository.findByUsuarioId(usuarioId);
        long aciertos = 0;
        for (HistorialEstudio h : historial) {
            if (h.getResultado()) {
                aciertos++;
            }
        }
        return aciertos;
    }

    public long totalFallos(Long usuarioId) {
        List<HistorialEstudio> historial = historialRepository.findByUsuarioId(usuarioId);
        long fallos = 0;
        for (HistorialEstudio h : historial) {
            if (!h.getResultado()) {
                fallos++;
            }
        }
        return fallos;
    }

    public double porcentajeAcierto(Long usuarioId) {
        List<HistorialEstudio> historial = historialRepository.findByUsuarioId(usuarioId);
        int total = historial.size();
        if (total == 0) return 0.0;

        long aciertos = 0;
        for (HistorialEstudio h : historial) {
            if (h.getResultado()) {
                aciertos++;
            }
        }
        return (double) aciertos / total * 100;
    }

    public List<Long> obtenerIdsTarjetasFalladasPorBarajas(Long usuarioId, List<Long> barajaIds) {
        return historialRepository.findIdsTarjetasFalladasPorUsuarioYBarajas(usuarioId, barajaIds);
    }
}