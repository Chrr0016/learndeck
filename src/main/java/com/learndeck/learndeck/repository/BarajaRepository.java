package com.learndeck.learndeck.repository;

import com.learndeck.learndeck.model.Baraja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BarajaRepository extends JpaRepository<Baraja, Long> {

    List<Baraja> findByUsuarioId(Long usuarioId);
}