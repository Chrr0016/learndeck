package com.learndeck.learndeck.service;

import com.learndeck.learndeck.model.Usuario;
import com.learndeck.learndeck.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    // Registro
    public boolean registrar(String nombre, String email, String contrasena) {
        if (usuarioRepository.existsByEmail(email)) {
            return false; // Email ya en uso
        }
        Usuario usuario=new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
         usuario.setContrasena(passwordEncoder.encode(contrasena));
        usuario.setRol("USER");
        usuario.setFechaRegistro(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return true;
    }

    // Login
    public Optional<Usuario> login(String email, String contrasena) {
        Optional<Usuario> usuario=usuarioRepository.findByEmail(email);
        if (usuario.isPresent() && passwordEncoder.matches(contrasena, usuario.get().getContrasena())) {
            return usuario;
        }
        return Optional.empty();
    }

    // Actualizar perfil
    public boolean actualizarPerfil(Long id, String nuevoNombre, String nuevoEmail, String nuevaContrasena) {
        Optional<Usuario> optional=usuarioRepository.findById(id);
        if (optional.isEmpty())
            return false;

        Usuario usuario=optional.get();

        // Validar si el email ha cambiado y si el nuevo ya existe en otro usuario
        if (!usuario.getEmail().equals(nuevoEmail) && usuarioRepository.existsByEmail(nuevoEmail)) {
            return false; // Email ya ocupado por otra persona
        }

        usuario.setNombre(nuevoNombre);
        usuario.setEmail(nuevoEmail);

        // Solo actualizamos la contraseña si el usuario escribió algo en el campo
        if (nuevaContrasena != null && !nuevaContrasena.trim().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        }

        usuarioRepository.save(usuario);
        return true;
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    public void cambiarRol(Long id, String rol) {
        Optional<Usuario> optional=usuarioRepository.findById(id);
        if (optional.isEmpty())
            return;

        Usuario usuario=optional.get();
        usuario.setRol(rol);
        usuarioRepository.save(usuario);
    }

}