package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Registro
    public boolean registrar(String nombre, String email, String contrasena) {
        if (usuarioRepository.existsByEmail(email)) {
            return false; //Email ya en uso
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setContrasena(contrasena);
        usuario.setFechaRegistro(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return true;
    }

    // Login
    public Optional<Usuario> login(String email, String contrasena) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isPresent() && usuario.get().getContrasena().equals(contrasena)) {
            return usuario;
        }
        return Optional.empty();
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }
}