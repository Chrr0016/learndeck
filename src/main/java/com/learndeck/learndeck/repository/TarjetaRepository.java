package com.learndeck.learndeck.repository;

import com.learndeck.learndeck.model.Tarjeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TarjetaRepository extends JpaRepository<Tarjeta, Long> {

    List<Tarjeta> findByBarajaId(Long barajaId);
}