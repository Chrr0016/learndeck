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

    public List<Tarjeta> obtenerPorBaraja(Long barajaId) {
        return tarjetaRepository.findByBarajaId(barajaId);
    }

    public Optional<Tarjeta> obtenerPorId(Long id) {
        return tarjetaRepository.findById(id);
    }

    public List<Tarjeta> obtenerPorIds(List<Long> ids) {
        return tarjetaRepository.findByIdIn(ids);
    }

    public Tarjeta crear(String pregunta, String respuesta, Baraja baraja) {
        Tarjeta tarjeta = new Tarjeta();
        tarjeta.setPregunta(pregunta);
        tarjeta.setRespuesta(respuesta);
        tarjeta.setBaraja(baraja);
        tarjeta.setNivelDificultad(0);
        tarjeta.setFechaCreacion(LocalDateTime.now());
        return tarjetaRepository.save(tarjeta);
    }

    public boolean editar(Long id, String pregunta, String respuesta, Long usuarioId) {
        Optional<Tarjeta> optional = tarjetaRepository.findById(id);
        if (optional.isEmpty()) return false;

        Tarjeta tarjeta = optional.get();

        // Verificamos que la tarjeta pertenece al usuario a través de su baraja
        if (!tarjeta.getBaraja().getUsuario().getId().equals(usuarioId)) return false;

        tarjeta.setPregunta(pregunta);
        tarjeta.setRespuesta(respuesta);
        tarjetaRepository.save(tarjeta);
        return true;
    }

    public boolean eliminar(Long id, Long usuarioId) {
        Optional<Tarjeta> optional = tarjetaRepository.findById(id);
        if (optional.isEmpty()) return false;

        if (!optional.get().getBaraja().getUsuario().getId().equals(usuarioId)) return false;

        tarjetaRepository.deleteById(id);
        return true;
    }
}