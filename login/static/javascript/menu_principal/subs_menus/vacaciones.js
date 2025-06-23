function cargarDatosVacaciones() {
    // Actualizar resumen
    document.getElementById('dias-acumulados').textContent = vacacionesData.diasAcumulados;
    document.getElementById('dias-tomados').textContent = vacacionesData.diasTomados;
    document.getElementById('dias-pendientes').textContent = vacacionesData.diasPendientes;
    
    // Cargar historial
    const tbody = document.getElementById('historial-vacaciones');
    tbody.innerHTML = '';
    
    vacacionesData.registros.forEach(registro => {
        const tr = document.createElement('tr');
        
        // Formatear fechas
        const fechaInicio = new Date(registro.fechaInicio);
        const fechaFin = new Date(registro.fechaFin);
        const opcionesFecha = { year: 'numeric', month: 'short', day: 'numeric' };
        
        tr.innerHTML = `
            <td>${fechaInicio.toLocaleDateString('es-ES', opcionesFecha)} - ${fechaFin.toLocaleDateString('es-ES', opcionesFecha)}</td>
            <td>${registro.diasPlanificados}</td>
            <td>${registro.diasEfectivos}</td>
            <td><span class="estado-badge estado-${registro.estado}">${obtenerEstadoTexto(registro.estado)}</span></td>
            <td>
                ${generarBotonesAccion(registro)}
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Función para obtener el texto del estado
function obtenerEstadoTexto(codigoEstado) {
    const estados = {
        'PLAN': 'Planificado',
        'APRO': 'Aprobado',
        'EN_C': 'En Curso',
        'PAUS': 'Pausado',
        'COMP': 'Completado',
        'CANC': 'Cancelado'
    };
    return estados[codigoEstado] || codigoEstado;
}

// Función para generar botones de acción según el estado
function generarBotonesAccion(registro) {
    let botones = '';
    
    // Botón para ver detalles siempre disponible
    botones += `<button class="btn btn-primary btn-sm ver-detalle" data-id="${registro.id}">
                    <i class="fas fa-eye"></i> Ver
                </button> `;
    
    // Acciones según estado
    switch(registro.estado) {
        case 'PLAN':
            botones += `<button class="btn btn-danger btn-sm cancelar" data-id="${registro.id}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>`;
            break;
            
        case 'APRO':
            botones += `<button class="btn btn-success btn-sm iniciar" data-id="${registro.id}">
                            <i class="fas fa-play"></i> Iniciar
                        </button>
                        <button class="btn btn-danger btn-sm cancelar" data-id="${registro.id}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>`;
            break;
            
        case 'EN_C':
            botones += `<button class="btn btn-warning btn-sm pausar" data-id="${registro.id}">
                            <i class="fas fa-pause"></i> Pausar
                        </button>
                        <button class="btn btn-success btn-sm completar" data-id="${registro.id}">
                            <i class="fas fa-check"></i> Completar
                        </button>`;
            break;
            
        case 'PAUS':
            botones += `<button class="btn btn-success btn-sm reanudar" data-id="${registro.id}">
                            <i class="fas fa-play"></i> Reanudar
                        </button>
                        <button class="btn btn-danger btn-sm cancelar" data-id="${registro.id}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>`;
            break;
    }
    
    return botones;
}

// Función para calcular días hábiles entre dos fechas
function calcularDiasHabiles(fechaInicio, fechaFin) {
    // Implementación similar a la del modelo
    let diasHabiles = 0;
    const fechaActual = new Date(fechaInicio);
    const fechaFinal = new Date(fechaFin);
    
    // Ajustar fechaInicio si es fin de semana
    while (fechaActual.getDay() >= 5) { // 5=sábado, 6=domingo
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    // Calcular días hábiles
    while (fechaActual <= fechaFinal) {
        if (fechaActual.getDay() < 5) { // 0-4 = lunes-viernes
            diasHabiles++;
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return diasHabiles;
}

// Funciones para manejar acciones
function mostrarDetalleRegistro(registro) {
    const modal = document.getElementById('modal-vacaciones');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalBody = document.getElementById('modal-body');
    
    modalTitulo.textContent = `Detalles de Vacaciones - ${obtenerEstadoTexto(registro.estado)}`;
    
    let contenido = `
        <p><strong>Período:</strong> ${registro.fechaInicio} al ${registro.fechaFin}</p>
        <p><strong>Días planificados:</strong> ${registro.diasPlanificados}</p>
        <p><strong>Días efectivos:</strong> ${registro.diasEfectivos}</p>
        <p><strong>Estado:</strong> <span class="estado-badge estado-${registro.estado}">${obtenerEstadoTexto(registro.estado)}</span></p>
    `;
    
    if (registro.estado === 'PAUS') {
        contenido += `
            <p><strong>Motivo de pausa:</strong> ${registro.motivoInhabilitacion || 'No especificado'}</p>
            <p><strong>Fecha de pausa:</strong> ${registro.fechaInhabilitacion || 'No especificada'}</p>
        `;
    }
    
    modalBody.innerHTML = contenido;
    document.getElementById('confirmar-accion').style.display = 'none';
    abrirModal();
}

function iniciarVacaciones(registro) {
    // Aquí iría la lógica para iniciar las vacaciones
    alert(`Iniciando vacaciones con ID ${registro.id}`);
    // Simular cambio de estado
    registro.estado = 'EN_C';
    cargarDatosVacaciones();
}

function mostrarFormularioPausa(registro) {
    const modal = document.getElementById('modal-vacaciones');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalBody = document.getElementById('modal-body');
    
    modalTitulo.textContent = 'Pausar Vacaciones';
    
    modalBody.innerHTML = `
        <p>Estás a punto de pausar tus vacaciones en curso. Por favor, indica la fecha y el motivo:</p>
        
        <div class="form-group">
            <label for="fecha-pausa">Fecha de Pausa:</label>
            <input type="date" id="fecha-pausa" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
        </div>
        
        <div class="form-group">
            <label for="motivo-pausa">Motivo:</label>
            <textarea id="motivo-pausa" class="form-control" rows="3" required></textarea>
        </div>
    `;
    
    document.getElementById('confirmar-accion').style.display = 'inline-block';
    document.getElementById('confirmar-accion').textContent = 'Confirmar Pausa';
    document.getElementById('confirmar-accion').onclick = function() {
        const fechaPausa = document.getElementById('fecha-pausa').value;
        const motivoPausa = document.getElementById('motivo-pausa').value;
        
        if (!fechaPausa || !motivoPausa) {
            alert('Por favor complete todos los campos');
            return;
        }
        
        // Aquí iría la lógica para pausar las vacaciones
        alert(`Pausando vacaciones con ID ${registro.id}\nFecha: ${fechaPausa}\nMotivo: ${motivoPausa}`);
        
        // Simular cambio de estado
        registro.estado = 'PAUS';
        registro.fechaInhabilitacion = fechaPausa;
        registro.motivoInhabilitacion = motivoPausa;
        cargarDatosVacaciones();
        cerrarModal();
    };
    
    abrirModal();
}

function reanudarVacaciones(registro) {
    // Aquí iría la lógica para reanudar las vacaciones
    alert(`Reanudando vacaciones con ID ${registro.id}`);
    // Simular cambio de estado
    registro.estado = 'EN_C';
    cargarDatosVacaciones();
}

function completarVacaciones(registro) {
    // Aquí iría la lógica para completar las vacaciones
    alert(`Completando vacaciones con ID ${registro.id}`);
    // Simular cambio de estado
    registro.estado = 'COMP';
    registro.diasEfectivos = registro.diasPlanificados; // Simulamos que disfrutó todos los días
    cargarDatosVacaciones();
}

function cancelarVacaciones(registro) {
    if (!confirm('¿Estás seguro de que deseas cancelar estas vacaciones?')) return;
    
    // Aquí iría la lógica para cancelar las vacaciones
    alert(`Cancelando vacaciones con ID ${registro.id}`);
    // Simular cambio de estado
    registro.estado = 'CANC';
    cargarDatosVacaciones();
}

// Funciones para manejar el modal
function abrirModal() {
    document.getElementById('modal-vacaciones').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    document.getElementById('modal-vacaciones').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos iniciales
    cargarDatosVacaciones();
    
    // Calcular días hábiles al cambiar fechas
    document.getElementById('fecha-inicio').addEventListener('change', function() {
        const fechaInicio = this.value;
        const fechaFin = document.getElementById('fecha-fin').value;
        
        if (fechaInicio && fechaFin) {
            const dias = calcularDiasHabiles(fechaInicio, fechaFin);
            document.getElementById('dias-planificados').value = dias;
        }
    });
    
    document.getElementById('fecha-fin').addEventListener('change', function() {
        const fechaFin = this.value;
        const fechaInicio = document.getElementById('fecha-inicio').value;
        
        if (fechaInicio && fechaFin) {
            const dias = calcularDiasHabiles(fechaInicio, fechaFin);
            document.getElementById('dias-planificados').value = dias;
        }
    });
    
    // Enviar formulario de solicitud
    document.getElementById('form-solicitud-vacaciones').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        const diasPlanificados = document.getElementById('dias-planificados').value;
        
        if (!fechaInicio || !fechaFin) {
            alert('Por favor complete ambas fechas');
            return;
        }
        
        if (new Date(fechaFin) <= new Date(fechaInicio)) {
            alert('La fecha de fin debe ser posterior a la de inicio');
            return;
        }
        
        if (diasPlanificados <= 0) {
            alert('El período seleccionado no contiene días hábiles');
            return;
        }
        
        // Aquí iría la llamada AJAX para guardar la solicitud
        alert(`Solicitud de vacaciones enviada:\nDesde: ${fechaInicio}\nHasta: ${fechaFin}\nDías: ${diasPlanificados}`);
        
        // Limpiar formulario
        this.reset();
    });
    
    // Manejar clics en botones de acción (delegación de eventos)
    document.getElementById('historial-vacaciones').addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const registroId = target.getAttribute('data-id');
        const registro = vacacionesData.registros.find(r => r.id == registroId);
        
        if (!registro) return;
        
        if (target.classList.contains('ver-detalle')) {
            mostrarDetalleRegistro(registro);
        } else if (target.classList.contains('iniciar')) {
            iniciarVacaciones(registro);
        } else if (target.classList.contains('pausar')) {
            mostrarFormularioPausa(registro);
        } else if (target.classList.contains('reanudar')) {
            reanudarVacaciones(registro);
        } else if (target.classList.contains('completar')) {
            completarVacaciones(registro);
        } else if (target.classList.contains('cancelar')) {
            cancelarVacaciones(registro);
        }
    });
    
    // Cerrar modal
    document.getElementById('close-modal').addEventListener('click', cerrarModal);
    document.getElementById('cancelar-accion').addEventListener('click', cerrarModal);
});