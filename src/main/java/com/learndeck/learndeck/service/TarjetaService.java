package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.repository.TarjetaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TarjetaService {

    @Autowired
    private TarjetaRepository tarjetaRepository;

    // Obtener tarjetas de una baraja
    public List<Tarjeta> obtenerPorBaraja(Long barajaId) {
        return tarjetaRepository.findByBarajaId(barajaId);
    }

    // Obtener una tarjeta por id
    public Optional<Tarjeta> obtenerPorId(Long id) {
        return tarjetaRepository.findById(id);
    }

    // Crear tarjeta
    public Tarjeta crear(String pregunta, String respuesta, Baraja baraja) {
        Tarjeta tarjeta = new Tarjeta();
        tarjeta.setPregunta(pregunta);
        tarjeta.setRespuesta(respuesta);
        tarjeta.setBaraja(baraja);
        tarjeta.setNivelDificultad(0);
        tarjeta.setFechaCreacion(LocalDateTime.now());
        return tarjetaRepository.save(tarjeta);
    }

    // Editar tarjeta
    public boolean editar(Long id, String pregunta, String respuesta, Long usuarioId) {
        Optional<Tarjeta> optional = tarjetaRepository.findById(id);
        if (optional.isEmpty()) return false;

        Tarjeta tarjeta = optional.get();

        // Comprobamos que la tarjeta pertenece al usuario
        if (!tarjeta.getBaraja().getUsuario().getId().equals(usuarioId)) return false;

        tarjeta.setPregunta(pregunta);
        tarjeta.setRespuesta(respuesta);
        tarjetaRepository.save(tarjeta);
        return true;
    }

    // Eliminar tarjeta
    public boolean eliminar(Long id, Long usuarioId) {
        Optional<Tarjeta> optional = tarjetaRepository.findById(id);
        if (optional.isEmpty()) return false;

        // Comprobamos que la tarjeta pertenece al usuario
        if (!optional.get().getBaraja().getUsuario().getId().equals(usuarioId)) return false;

        tarjetaRepository.deleteById(id);
        return true;
    }
}