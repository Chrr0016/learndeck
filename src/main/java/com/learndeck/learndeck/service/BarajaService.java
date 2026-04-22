package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.repository.BarajaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BarajaService {

    @Autowired
    private BarajaRepository barajaRepository;

    // Obtener todas las barajas de un usuario
    public List<Baraja> obtenerBarajasPorUsuario(Long usuarioId) {
        return barajaRepository.findByUsuarioId(usuarioId);
    }

    // Obtener una baraja por id
    public Optional<Baraja> obtenerPorId(Long id) {
        return barajaRepository.findById(id);
    }

    // Crear baraja
    public Baraja crear(String titulo, String categoria, Usuario usuario) {
        Baraja baraja = new Baraja();
        baraja.setTitulo(titulo);
        baraja.setCategoria(categoria);
        baraja.setUsuario(usuario);
        baraja.setFechaCreacion(LocalDateTime.now());
        return barajaRepository.save(baraja);
    }

    // Editar baraja
    public boolean editar(Long id, String titulo, String categoria, Long usuarioId) {
        Optional<Baraja> optional = barajaRepository.findById(id);
        if (optional.isEmpty()) return false;

        Baraja baraja = optional.get();

        // Comprobamos que la baraja pertenece al usuario
        if (!baraja.getUsuario().getId().equals(usuarioId)) return false;

        baraja.setTitulo(titulo);
        baraja.setCategoria(categoria);
        barajaRepository.save(baraja);
        return true;
    }

    // Eliminar baraja
    public boolean eliminar(Long id, Long usuarioId) {
        Optional<Baraja> optional = barajaRepository.findById(id);
        if (optional.isEmpty()) return false;

        // Comprobamos que la baraja pertenece al usuario
        if (!optional.get().getUsuario().getId().equals(usuarioId)) return false;

        barajaRepository.deleteById(id);
        return true;
    }
}