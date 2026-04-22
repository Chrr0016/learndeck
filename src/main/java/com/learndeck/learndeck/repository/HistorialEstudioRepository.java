package com.learndeck.learndeck.repository;

import com.learndeck.learndeck.model.HistorialEstudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialEstudioRepository extends JpaRepository<HistorialEstudio, Long> {

    // Todo el historial de un usuario
    List<HistorialEstudio> findByUsuarioId(Long usuarioId);

    // Tarjetas falladas de un usuario
    List<HistorialEstudio> findByUsuarioIdAndResultado(Long usuarioId, Boolean resultado);

    // Historial de una tarjeta concreta
    List<HistorialEstudio> findByTarjetaId(Long tarjetaId);
}