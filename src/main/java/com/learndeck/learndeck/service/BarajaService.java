package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.Baraja;
import com.learndeck.learndeck.model.Tarjeta;
import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.repository.BarajaRepository;
import com.learndeck.learndeck.repository.TarjetaRepository;
import com.learndeck.learndeck.repository.UsuarioRepository;

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
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private TarjetaRepository tarjetaRepository;

    // elimina espacios y pone la primera letra en mayúscula
    // Así "idiomas", "IDIOMAS" e "Idiomas" se guardan siempre igual
    private String normalizarCategoria(String categoria) {
        if (categoria == null || categoria.trim().isEmpty())
            return null;
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
        if (optional.isEmpty())
            return false;

        Baraja baraja = optional.get();

        // Comprobar que la baraja pertenece al usuario que hace la peticion
        if (!baraja.getUsuario().getId().equals(usuarioId))
            return false;

        baraja.setTitulo(titulo);
        baraja.setCategoria(normalizarCategoria(categoria));
        barajaRepository.save(baraja);
        return true;
    }

    public boolean eliminar(Long id, Long usuarioId) {
        Optional<Baraja> optional = barajaRepository.findById(id);
        if (optional.isEmpty())
            return false;

        if (!optional.get().getUsuario().getId().equals(usuarioId))
            return false;

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

    public List<Baraja> obtenerTodas() {
        return barajaRepository.findAll();
    }

    public void eliminarComoAdmin(Long id) {
        barajaRepository.deleteById(id);
    }

    public List<Baraja> obtenerCompartidas(Long usuarioId) {
        return barajaRepository.findByCompartidaTrueAndUsuarioIdNot(usuarioId);
    }

    public List<String> obtenerCategoriasComunidad(Long usuarioId) {
        return barajaRepository.findCategoriasComunidad(usuarioId);
    }

    public void toggleCompartida(Long id, Long usuarioId) {
        Optional<Baraja> optional = barajaRepository.findById(id);
        if (optional.isEmpty())
            return;

        Baraja baraja = optional.get();
        if (!baraja.getUsuario().getId().equals(usuarioId))
            return;

        baraja.setCompartida(!baraja.isCompartida());
        barajaRepository.save(baraja);
    }

    public boolean guardarCopia(Long barajaOriginalId, Long usuarioIdDestino) {
    
    if (barajaRepository.existsByUsuarioIdAndBarajaOriginalId(usuarioIdDestino, barajaOriginalId)) {
        return false; 
    }

    Optional<Baraja> original = barajaRepository.findById(barajaOriginalId);
    if (original.isEmpty()) return false;

    Optional<Usuario> usuario = usuarioRepository.findById(usuarioIdDestino);
    if (usuario.isEmpty()) return false;

    Baraja copia = new Baraja();
    copia.setTitulo(original.get().getTitulo());
    copia.setCategoria(original.get().getCategoria());
    copia.setUsuario(usuario.get());
    copia.setFechaCreacion(LocalDateTime.now());
    copia.setCompartida(false);
    copia.setBarajaOriginalId(barajaOriginalId);
    Baraja copiaGuardada = barajaRepository.save(copia);

    for (Tarjeta tarjeta : original.get().getTarjetas()) {
        Tarjeta nuevaTarjeta = new Tarjeta();
        nuevaTarjeta.setPregunta(tarjeta.getPregunta());
        nuevaTarjeta.setRespuesta(tarjeta.getRespuesta());
        nuevaTarjeta.setBaraja(copiaGuardada);
        nuevaTarjeta.setNivelDificultad(0);
        nuevaTarjeta.setFechaCreacion(LocalDateTime.now());
        tarjetaRepository.save(nuevaTarjeta);
    }

    return true; 
}
}