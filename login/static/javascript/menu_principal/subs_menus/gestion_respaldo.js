function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function initGestionRespaldo() {
    console.log("Inicializando módulo de gestión de respaldos...");
    
    // Verificar elementos críticos
    const container = document.querySelector('.contenedor-principal');
    if (!container) {
        console.error("No se encontró el contenedor principal");
        return;
    }
    
    // Configurar eventos con delegación
    container.addEventListener('click', function(e) {
        // Botón crear respaldo
        if (e.target.closest('.accion-boton.principal')) {
            e.preventDefault();
            realizarRespaldo();
        }
        
        // Botones de acción en la tabla
        if (e.target.closest('.tabla-respaldos__boton--restaurar')) {
            e.preventDefault();
            const backup = e.target.closest('tr').querySelector('.nombre-respaldo').textContent;
            console.log("Restaurar clicked for backup:", backup);
            confirmarRestauracion(backup);
        }
        
        if (e.target.closest('.tabla-respaldos__boton--eliminar')) {
            e.preventDefault();
            const backup = e.target.closest('tr').querySelector('.nombre-respaldo').textContent;
            console.log("Eliminar clicked for backup:", backup);
            confirmarEliminacion(backup, e);
        }
    });
    
    // Checkbox "Seleccionar todos"
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('.tabla-respaldos__fila input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });
    }
    
    // Cargar datos iniciales
    listBackups();
}

// Cargar backups al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    initGestionRespaldo();
});

function listBackups() {
    const tableBody = document.querySelector('.tabla-respaldos__tbody');
    const tableInfo = document.getElementById('tablaInfo');
    
    if (!tableBody || !tableInfo) {
        console.error("Elementos de la tabla no encontrados");
        return;
    }
    
    tableBody.innerHTML = '<tr><td colspan="3" class="tabla-respaldos__celda"><i class="fas fa-spinner fa-spin"></i> Cargando respaldos...</td></tr>';
    
    fetch('/list_backups/')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta');
            return response.json();
        })
        .then(data => {
            tableBody.innerHTML = '';
            
            if (!data.backups || data.backups.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" class="tabla-respaldos__celda">No hay respaldos disponibles</td></tr>';
                tableInfo.textContent = 'Mostrando 0 registros';
                return;
            }
            
            data.backups.forEach(backup => {
                const row = document.createElement('tr');
                row.className = 'tabla-respaldos__fila';
                row.innerHTML = `
                    <td class="tabla-respaldos__celda">
                        <input type="checkbox" class="backup-checkbox" value="${backup}">
                    </td>
                    <td class="tabla-respaldos__celda nombre-respaldo">${backup}</td>
                    <td class="tabla-respaldos__celda">
                        <button class="tabla-respaldos__boton tabla-respaldos__boton--restaurar">
                            <i class="fa-solid fa-rotate-left"></i> Restaurar
                        </button>
                        <button class="tabla-respaldos__boton tabla-respaldos__boton--eliminar secundario">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            tableInfo.textContent = `Mostrando ${data.backups.length} registros`;
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="3" class="tabla-respaldos__celda error">Error al cargar respaldos: ${error.message}</td></tr>`;
        });
}

// Función para crear un nuevo respaldo
function realizarRespaldo() {
    const btn = document.querySelector('.accion-boton.principal');
    const originalText = btn.innerHTML;
    
    // Mostrar estado de carga
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creando respaldo...';
    
    fetch('/create_backup/', {
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Respaldo creado correctamente');
        listBackups();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al crear respaldo: ' + error.message);
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
    });
}

// Función para confirmar restauración
function confirmarRestauracion(backupFile) {
    mostrarModal(
        'Confirmar restauración',
        `¿Está seguro que desea restaurar el respaldo "${backupFile}"? Esta acción no se puede deshacer.`,
        () => restaurarRespaldo(backupFile)
    );
}

// Función para restaurar un respaldo
function restaurarRespaldo(backupFile) {
    const formData = new FormData();
    formData.append('backup_file', backupFile);

    fetch('/restore_backup/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Respaldo restaurado correctamente');
        cerrarModal();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al restaurar respaldo: ' + error.message);
    });
}

// Función para confirmar eliminación
function confirmarEliminacion(backupFile, event) {  // Añadir event como parámetro
    if(event) event.preventDefault();
    
    mostrarModal(
        'Confirmar eliminación',
        `¿Está seguro que desea eliminar "${backupFile}"?`,
        () => eliminarRespaldo(backupFile)
    );
}

// Función para eliminar un respaldo
function eliminarRespaldo(backupFile) {
    const confirmBtn = document.getElementById('modalConfirmar');
    const originalText = confirmBtn.innerHTML;
    
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';

    fetch('/delete_backup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({backup_file: backupFile})
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { 
                throw new Error(err.message || 'Error del servidor'); 
            });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Respaldo eliminado correctamente');
        listBackups();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar respaldo: ' + error.message);
    })
    .finally(() => {
        cerrarModal();
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
    });
}

// Funciones para el modal de confirmación
function mostrarModal(titulo, mensaje, accionConfirmar) {
    const modal = document.getElementById('respaldoModal');
    const tituloModal = document.getElementById('modalTitulo');
    const mensajeModal = document.getElementById('modalMensaje');
    const btnConfirmar = document.getElementById('modalConfirmar');
    
    if (!modal || !tituloModal || !mensajeModal || !btnConfirmar) {
        console.log("mostrarModal: Elementos del modal no encontrados");
        return;
    }
    
    console.log("mostrarModal: Mostrando modal con título:", titulo);
    tituloModal.textContent = titulo;
    mensajeModal.textContent = mensaje;
    btnConfirmar.onclick = accionConfirmar;
    modal.classList.add('active');
}

function cerrarModal() {
    const modal = document.getElementById('respaldoModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Funciones de búsqueda (pendientes de implementación)
function buscarRespaldo() {
    alert('La funcionalidad de búsqueda está pendiente de implementación');
}

function limpiarBusqueda() {
    document.getElementById('buscarRespaldo').value = '';
    listBackups();
}

window.initGestionRespaldo = initGestionRespaldo;
window.realizarRespaldo = realizarRespaldo;
