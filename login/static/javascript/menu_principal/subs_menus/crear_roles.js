document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const rolModal = document.getElementById('rol-modal');
    const btnNuevoRol = document.getElementById('btn-nuevo-rol');
    const btnCancelar = document.querySelector('.btn-cancel');
    const btnClose = document.querySelector('.btn-close');
    let currentRolId = null;
    
    // Abrir modal para nuevo rol
    btnNuevoRol.addEventListener('click', function() {
        currentRolId = null;
        document.getElementById('modal-title').textContent = 'Nuevo Rol';
        document.getElementById('rol-form').reset();
        cargarPermisosDisponibles();
        rolModal.style.display = 'flex';
    });
    
    // Abrir modal para editar rol
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-edit')) {
            const row = e.target.closest('tr');
            currentRolId = row.dataset.rolId;
            
            // Simular datos del rol (en producción sería una petición AJAX)
            const rolData = {
                nombre: row.querySelector('td:nth-child(1) .badge').textContent,
                codigo: currentRolId,
                descripcion: row.querySelector('td:nth-child(2)').textContent,
                permisos: [1, 2, 4, 5, 6] // IDs de permisos asignados (ejemplo)
            };
            
            document.getElementById('modal-title').textContent = `Editar Rol: ${rolData.nombre}`;
            document.getElementById('rol-nombre').value = rolData.nombre;
            document.getElementById('rol-codigo').value = rolData.codigo;
            document.getElementById('rol-descripcion').value = rolData.descripcion;
            
            cargarPermisosDisponibles(currentRolId);
            rolModal.style.display = 'flex';
        }
    });
    
    // Cerrar modal
    function closeModal() {
        rolModal.style.display = 'none';
    }
    
    btnCancelar.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);
    
    // Cargar permisos disponibles
    async function cargarPermisosDisponibles(rolId = null) {
        try {
            const [permisosResponse, rolResponse] = await Promise.all([
                fetch('/api/permisos/'),
                rolId ? fetch(`/api/roles/${rolId}/permisos/`) : Promise.resolve(null)
            ]);
            
            const [permisos, rolPermisos] = await Promise.all([
                permisosResponse.json(),
                rolResponse ? rolResponse.json() : Promise.resolve([])
            ]);
            
            renderizarPermisos(permisos, rolPermisos);
            
        } catch (error) {
            console.error("Error cargando permisos:", error);
            document.getElementById('permisos-container').innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i> Error cargando los permisos
                </div>
            `;
        }
    }
    
    // Renderizar lista de permisos
    function renderizarPermisos(permisos, permisosAsignados = []) {
        const container = document.getElementById('permisos-container');
        const contador = document.getElementById('contador-permisos');
        
        // Ordenar permisos alfabéticamente por nombre
        permisos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        let html = '';
        let seleccionados = 0;
        
        permisos.forEach(permiso => {
            const estaSeleccionado = permisosAsignados.includes(permiso.id);
            if (estaSeleccionado) seleccionados++;
            
            html += `
                <label class="permiso-item">
                    <input type="checkbox" name="permisos" value="${permiso.id}" 
                        ${estaSeleccionado ? 'checked' : ''}>
                    <span class="permiso-nombre">${permiso.nombre}</span>
                    <span class="permiso-codigo">${permiso.codigo}</span>
                </label>
            `;
        });
        
        container.innerHTML = html || '<div class="no-permisos">No hay permisos disponibles</div>';
        contador.textContent = seleccionados;
        
        // Actualizar contador cuando cambian las selecciones
        container.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                const total = container.querySelectorAll('input[type="checkbox"]:checked').length;
                contador.textContent = total;
            }
        });
        
        // Configurar búsqueda
        document.getElementById('search-permisos').addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.permiso-item').forEach(item => {
                const texto = item.textContent.toLowerCase();
                item.style.display = texto.includes(term) ? 'flex' : 'none';
            });
        });
    }
    
    // Guardar rol
    document.querySelector('.btn-save').addEventListener('click', function() {
        const form = document.getElementById('rol-form');
        
        if (form.checkValidity()) {
            const formData = {
                id: currentRolId,
                nombre: document.getElementById('rol-nombre').value,
                codigo: document.getElementById('rol-codigo').value,
                descripcion: document.getElementById('rol-descripcion').value,
                permisos: Array.from(document.querySelectorAll('input[name="permisos"]:checked')).map(el => el.value)
            };
            
            // Aquí iría tu lógica para guardar (AJAX al backend)
            console.log('Datos a guardar:', formData);
            alert(currentRolId ? 'Rol actualizado correctamente' : 'Rol creado correctamente');
            closeModal();
            
            // En producción, actualizarías la tabla aquí
            // location.reload(); o actualización dinámica
        } else {
            form.reportValidity();
        }
    });
    
    // Búsqueda en tabla de roles
    document.getElementById('search-roles').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.tabla-roles tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
    
    // Filtrar roles
    document.getElementById('filter-roles').addEventListener('change', function(e) {
        const filterValue = e.target.value;
        document.querySelectorAll('.tabla-roles tbody tr').forEach(row => {
            if (filterValue === 'all') {
                row.style.display = '';
            } else {
                // Implementar lógica de filtrado según tu necesidad
                row.style.display = ''; // Mostrar todos por defecto en este ejemplo
            }
        });
    });
});