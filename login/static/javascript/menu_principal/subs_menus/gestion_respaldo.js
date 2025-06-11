// Función para obtener el token CSRF
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

// Cargar backups al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    listBackups();
    
    // Configurar checkbox "Seleccionar todos"
    document.getElementById('selectAll')?.addEventListener('change', function(e) {
        const checkboxes = document.querySelectorAll('.tabla-respaldos__tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
});

// Listar todos los backups disponibles
function listBackups() {
    fetch('/list_backups/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('.tabla-respaldos__tbody');
            const tableInfo = document.getElementById('tablaInfo');
            
            if (!tableBody || !tableInfo) return;
            
            tableBody.innerHTML = '';
            
            if (!data.backups || data.backups.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="3" class="tabla-respaldos__celda">No hay respaldos disponibles</td>';
                tableBody.appendChild(emptyRow);
                tableInfo.textContent = 'Mostrando 0 registros';
                return;
            }
            
            data.backups.forEach(backup => {
                const row = document.createElement('tr');
                row.classList.add('tabla-respaldos__fila');

                // Celda de selección
                const selectCell = document.createElement('td');
                selectCell.classList.add('tabla-respaldos__celda');
                const selectCheckbox = document.createElement('input');
                selectCheckbox.type = 'checkbox';
                selectCheckbox.classList.add('backup-checkbox');
                selectCell.appendChild(selectCheckbox);
                row.appendChild(selectCell);

                // Celda de nombre
                const nameCell = document.createElement('td');
                nameCell.classList.add('tabla-respaldos__celda');
                nameCell.textContent = backup;
                row.appendChild(nameCell);

                // Celda de opciones
                const optionsCell = document.createElement('td');
                optionsCell.classList.add('tabla-respaldos__celda');
                
                // Botón de restaurar
                const restoreButton = document.createElement('button');
                restoreButton.classList.add('tabla-respaldos__boton');
                restoreButton.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Restaurar';
                restoreButton.onclick = () => confirmarRestauracion(backup);
                optionsCell.appendChild(restoreButton);
                
                // Botón de eliminar
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('tabla-respaldos__boton', 'secundario');
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';
                deleteButton.onclick = () => confirmarEliminacion(backup);
                optionsCell.appendChild(deleteButton);

                row.appendChild(optionsCell);
                tableBody.appendChild(row);
            });
            
            tableInfo.textContent = `Mostrando registros del 1 al ${data.backups.length} de un total de ${data.backups.length} registros`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar la lista de respaldos: ' + error.message);
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
function confirmarEliminacion(backupFile) {
    mostrarModal(
        'Confirmar eliminación',
        `¿Está seguro que desea eliminar permanentemente el respaldo "${backupFile}"? Esta acción no se puede deshacer.`,
        () => eliminarRespaldo(backupFile)
    );
}

// Función para eliminar un respaldo
function eliminarRespaldo(backupFile) {
    const formData = new FormData();
    formData.append('backup_file', backupFile);

    fetch('/delete_backup/', {
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
        alert(data.message || 'Respaldo eliminado correctamente');
        listBackups();
        cerrarModal();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar respaldo: ' + error.message);
    });
}

// Funciones para el modal de confirmación
function mostrarModal(titulo, mensaje, accionConfirmar) {
    const modal = document.getElementById('respaldoModal');
    const tituloModal = document.getElementById('modalTitulo');
    const mensajeModal = document.getElementById('modalMensaje');
    const btnConfirmar = document.getElementById('modalConfirmar');
    
    if (!modal || !tituloModal || !mensajeModal || !btnConfirmar) return;
    
    tituloModal.textContent = titulo;
    mensajeModal.textContent = mensaje;
    btnConfirmar.onclick = accionConfirmar;
    modal.style.display = 'block';
}

function cerrarModal() {
    const modal = document.getElementById('respaldoModal');
    if (modal) {
        modal.style.display = 'none';
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