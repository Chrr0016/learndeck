package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.repository.BarajaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

// @Service le dice a Spring que esta clase es un servicio y la registra
// para poder inyectarla con @Autowired en los controllers
@Service
public class BarajaService {

    @Autowired
    private BarajaRepository barajaRepository;

    // elimina espacios y pone la primera letra en mayúscula
    // Así "idiomas", "IDIOMAS" e "Idiomas" se guardan siempre igual
    private String normalizarCategoria(String categoria) {
        if (categoria == null || categoria.trim().isEmpty()) return null;
        String c = categoria.trim();
        return c.substring(0, 1).toUpperCase() + c.substring(1).toLowerCase();
    }

    public List<Baraja> obtenerBarajasPorUsuario(Long usuarioId) {
        return barajaRepository.findByUsuarioId(usuarioId);
    }

    public Optional<Baraja> obtenerPorId(Long id) {
        return barajaRepository.findById(id);
    }

    public Baraja crear(String titulo, String categoria, Usuario usuario) {
        Baraja baraja = new Baraja();
        baraja.setTitulo(titulo);
        baraja.setCategoria(normalizarCategoria(categoria));
        baraja.setUsuario(usuario);
        baraja.setFechaCreacion(LocalDateTime.now());
        return barajaRepository.save(baraja);
    }

    public boolean editar(Long id, String titulo, String categoria, Long usuarioId) {
        Optional<Baraja> optional = barajaRepository.findById(id);
        if (optional.isEmpty()) return false;

        Baraja baraja = optional.get();

        // Comprobar que la baraja pertenece al usuario que hace la peticion
        if (!baraja.getUsuario().getId().equals(usuarioId)) return false;

        baraja.setTitulo(titulo);
        baraja.setCategoria(normalizarCategoria(categoria));
        barajaRepository.save(baraja);
        return true;
    }

    public boolean eliminar(Long id, Long usuarioId) {
        Optional<Baraja> optional = barajaRepository.findById(id);
        if (optional.isEmpty()) return false;

        if (!optional.get().getUsuario().getId().equals(usuarioId)) return false;

        barajaRepository.deleteById(id);
        return true;
    }

    // Devuelve las categorías únicas del usuario, normalizadas y ordenadas
    public List<String> obtenerCategorias(Long usuarioId) {
        List<String> todasLasCategorias = barajaRepository.findCategoriasByUsuario(usuarioId);
        List<String> resultado = new ArrayList<>();

        for (String cat : todasLasCategorias) {
            if (cat != null && !cat.trim().isEmpty()) {
                String normalizada = normalizarCategoria(cat);
                if (!resultado.contains(normalizada)) {
                    resultado.add(normalizada);
                }
            }
        }

        Collections.sort(resultado);
        return resultado;
    }
}