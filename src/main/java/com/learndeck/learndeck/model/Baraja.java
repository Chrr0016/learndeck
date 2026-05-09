package com.learndeck.learndeck.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="barajas")
public class Baraja {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String titulo;

    private String categoria;

    private LocalDateTime fechaCreacion;

    @ManyToOne
    @JoinColumn(name="usuario_id", nullable=false)
    private Usuario usuario;

    @OneToMany(mappedBy="baraja", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<Tarjeta> tarjetas;

    @Column(nullable=false)
    private boolean compartida=false;

    @Column(name="baraja_original_id")
    private Long barajaOriginalId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id=id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo=titulo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria=categoria;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion=fechaCreacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario=usuario;
    }

    public List<Tarjeta> getTarjetas() {
        return tarjetas;
    }

    public void setTarjetas(List<Tarjeta> tarjetas) {
        this.tarjetas=tarjetas;
    }

    public boolean isCompartida() {
        return compartida;
    }

    public void setCompartida(boolean compartida) {
        this.compartida=compartida;
    }

    public Long getBarajaOriginalId() {
        return barajaOriginalId;
    }

    public void setBarajaOriginalId(Long barajaOriginalId) {
        this.barajaOriginalId=barajaOriginalId;
    }
}