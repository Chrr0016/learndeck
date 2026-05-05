package com.learndeck.learndeck.repository;

import com.learndeck.learndeck.model.HistorialEstudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// @Repository marca esta interfaz como componente de acceso a datos.
// JpaRepository<HistorialEstudio, Long> nos da los métodos básicos de BD
// (save, findById, delete...) sin tener que implementarlos nosotros.
@Repository
public interface HistorialEstudioRepository extends JpaRepository<HistorialEstudio, Long> {

    // Esta query devuelve los IDs de tarjetas cuyo ÚLTIMO intento del usuario fue fallado.
    // La subconsulta (SELECT MAX...) obtiene la fecha del intento más reciente de cada tarjeta,
    // y la condición exterior comprueba que ese último intento fue incorrecto (resultado = false).
    // Sin la subconsulta, devolvería tarjetas que alguna vez se fallaron aunque luego se acertaran.
    @Query("""
        SELECT h.tarjeta.id
        FROM HistorialEstudio h
        WHERE h.usuario.id = :usuarioId
          AND h.tarjeta.baraja.id IN :barajaIds
          AND h.resultado = false
          AND h.fechaEstudio = (
              SELECT MAX(h2.fechaEstudio)
              FROM HistorialEstudio h2
              WHERE h2.tarjeta.id = h.tarjeta.id
                AND h2.usuario.id = :usuarioId
          )
    """)
    List<Long> findIdsTarjetasFalladasPorUsuarioYBarajas(
            @Param("usuarioId") Long usuarioId,
            @Param("barajaIds") List<Long> barajaIds
    );

    // Devuelve todo el historial de un usuario
    List<HistorialEstudio> findByUsuarioId(Long usuarioId);

    // Devuelve el historial filtrado por resultado (true = correctas, false = falladas)
    List<HistorialEstudio> findByUsuarioIdAndResultado(Long usuarioId, Boolean resultado);

    // Devuelve el historial de una tarjeta concreta
    List<HistorialEstudio> findByTarjetaId(Long tarjetaId);
}