package com.learndeck.learndeck.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tarjetas")
public class Tarjeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String pregunta;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String respuesta;

    private Integer nivelDificultad = 0;

    private LocalDateTime fechaCreacion;

    @ManyToOne
    @JoinColumn(name = "baraja_id", nullable = false)
    private Baraja baraja;

    @OneToMany(mappedBy = "tarjeta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistorialEstudio> historial;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPregunta() { return pregunta; }
    public void setPregunta(String pregunta) { this.pregunta = pregunta; }
    public String getRespuesta() { return respuesta; }
    public void setRespuesta(String respuesta) { this.respuesta = respuesta; }
    public Integer getNivelDificultad() { return nivelDificultad; }
    public void setNivelDificultad(Integer nivelDificultad) { this.nivelDificultad = nivelDificultad; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public Baraja getBaraja() { return baraja; }
    public void setBaraja(Baraja baraja) { this.baraja = baraja; }
    public List<HistorialEstudio> getHistorial() { return historial; }
    public void setHistorial(List<HistorialEstudio> historial) { this.historial = historial; }
}