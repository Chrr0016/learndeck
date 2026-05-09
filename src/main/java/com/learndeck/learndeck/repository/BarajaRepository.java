package com.learndeck.learndeck.repository;

import com.learndeck.learndeck.model.Baraja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarajaRepository extends JpaRepository<Baraja, Long> {

    List<Baraja> findByUsuarioId(Long usuarioId);

    @Query("SELECT DISTINCT b.categoria FROM Baraja b WHERE b.usuario.id=:userId")
    List<String> findCategoriasByUsuario(Long userId);

    List<Baraja> findByCompartidaTrueAndUsuarioIdNot(Long usuarioId);

    @Query("SELECT DISTINCT b.categoria FROM Baraja b WHERE b.compartida=true AND b.usuario.id != :userId AND b.categoria IS NOT NULL")
    List<String> findCategoriasComunidad(@Param("userId") Long userId);

    // Comprueba si el usuario ya tiene una copia de esa baraja original
    boolean existsByUsuarioIdAndBarajaOriginalId(Long usuarioId, Long barajaOriginalId);
}