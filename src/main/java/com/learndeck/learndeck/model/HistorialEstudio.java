package com.learndeck.learndeck.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estudio")
public class HistorialEstudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaEstudio;

    @Column(nullable = false)
    private Boolean resultado; // true = correcto, false = incorrecto

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "tarjeta_id", nullable = false)
    private Tarjeta tarjeta;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getFechaEstudio() { return fechaEstudio; }
    public void setFechaEstudio(LocalDateTime fechaEstudio) { this.fechaEstudio = fechaEstudio; }
    public Boolean getResultado() { return resultado; }
    public void setResultado(Boolean resultado) { this.resultado = resultado; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Tarjeta getTarjeta() { return tarjeta; }
    public void setTarjeta(Tarjeta tarjeta) { this.tarjeta = tarjeta; }
}