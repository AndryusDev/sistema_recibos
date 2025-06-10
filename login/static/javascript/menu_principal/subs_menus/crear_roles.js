// Namespace para evitar conflictos con otros módulos
const CrearRolesModule = {
    API_ROLES_URL: '/api/roles_listar/',
    API_PERMISOS_URL: '/api/permisos/',
    API_ROLES_MANAGE_URL: '/api/roles/manejar/',
    roles: [],
    permisos: [],
    currentRolId: null
};

// Función para cargar y mostrar la lista de roles
async function cargarRoles(busqueda = '') {
    const tbody = document.querySelector('.tabla-datos__tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <i class="fas fa-spinner fa-spin"></i> Cargando roles...
            </td>
        </tr>
    `;

    try {
        const params = new URLSearchParams();
        if (busqueda) params.append('search', busqueda);

        const response = await fetch(`${CrearRolesModule.API_ROLES_URL}?${params.toString()}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);

        const data = await response.json();

        if (data.success && data.roles && data.roles.length > 0) {
            CrearRolesModule.roles = data.roles;
            renderizarRoles(CrearRolesModule.roles);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No se encontraron roles</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center error">
                    Error al cargar roles: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Función para renderizar la tabla de roles
function renderizarRoles(roles) {
    const tbody = document.querySelector('.tabla-datos__tbody');
    tbody.innerHTML = roles.map(rol => `
        <tr class="tabla-datos__fila" data-rol-id="${rol.codigo_rol}">
            <td class="tabla-datos__celda">
                <span class="badge rol-${rol.codigo_rol}">${rol.nombre_rol}</span>
            </td>
            <td class="tabla-datos__celda">${rol.descripcion || ''}</td>
            <td class="tabla-datos__celda">${rol.permisos.length || 0}</td>
            <td class="tabla-datos__celda">${rol.usuarios_count || 0}</td>
            <td class="tabla-datos__celda">
                <button class="tabla-datos__boton btn-editar" title="Editar" data-id="${rol.codigo_rol}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="tabla-datos__boton btn-eliminar" title="Eliminar" data-id="${rol.codigo_rol}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}


// Función para abrir el modal para crear o editar rol
async function abrirModalRol(rolId = null) {
    CrearRolesModule.currentRolId = rolId;
    document.getElementById('modal-title').textContent = rolId ? 'Editar Rol' : 'Nuevo Rol';
    const form = document.getElementById('rol-form');
    form.reset();

    await cargarPermisos();

    if (rolId) {
        // Cargar datos del rol para editar
        const rol = CrearRolesModule.roles.find(r => r.id == rolId);
        if (rol) {
            document.getElementById('rol-nombre').value = rol.nombre || '';
            document.getElementById('rol-codigo').value = rol.codigo || '';
            document.getElementById('rol-descripcion').value = rol.descripcion || '';

            // Marcar permisos asignados
            const permisosAsignados = rol.permisos || [];
            CrearRolesModule.permisos.forEach(permiso => {
                const checkbox = document.querySelector(`input[name="permisos"][value="${permiso.id}"]`);
                if (checkbox) {
                    checkbox.checked = permisosAsignados.includes(permiso.id);
                }
            });
        }
    }

    document.getElementById('rol-modal').style.display = 'flex';
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById('rol-modal').style.display = 'none';
}

// Función para cargar permisos y renderizarlos
async function cargarPermisos() {
    try {
        const response = await fetch(CrearRolesModule.API_PERMISOS_URL, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error al cargar permisos');

        CrearRolesModule.permisos = data.permisos || [];
        renderizarPermisos(CrearRolesModule.permisos);
    } catch (error) {
        console.error('Error al cargar permisos:', error);
        document.getElementById('permisos-container').innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> Error cargando los permisos
            </div>
        `;
    }
}

// Función para renderizar permisos en el modal
function renderizarPermisos(permisos) {
    const container = document.getElementById('permisos-container');
    const contador = document.getElementById('contador-permisos');

    permisos.sort((a, b) => a.nombre.localeCompare(b.nombre));

    let html = '';
    permisos.forEach(permiso => {
        html += `
            <label class="permiso-item">
                <input type="checkbox" name="permisos" value="${permiso.codigo}">
                <span class="permiso-nombre">${permiso.nombre}</span>
                <span class="permiso-codigo">${permiso.codigo}</span>
            </label>
        `;
    });

    container.innerHTML = html || '<div class="no-permisos">No hay permisos disponibles</div>';
    contador.textContent = '0';

    container.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
            const total = container.querySelectorAll('input[type="checkbox"]:checked').length;
            contador.textContent = total;
        }
    });

    document.getElementById('search-permisos').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.permiso-item').forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(term) ? 'flex' : 'none';
        });
    });
}

// Función para guardar rol (crear o actualizar)
async function guardarRol() {
    const form = document.getElementById('rol-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const nombre = document.getElementById('rol-nombre').value.trim();
    const codigo = document.getElementById('rol-codigo').value.trim();
    const descripcion = document.getElementById('rol-descripcion').value.trim();
    const permisosSeleccionados = Array.from(document.querySelectorAll('input[name="permisos"]:checked')).map(el => parseInt(el.value));

    const payload = {
        nombre,
        codigo,
        descripcion,
        permisos: permisosSeleccionados
    };

    try {
        const url = CrearRolesModule.currentRolId 
            ? `${CrearRolesModule.API_ROLES_MANAGE_URL}${CrearRolesModule.currentRolId}/`
            : CrearRolesModule.API_ROLES_MANAGE_URL;

        const method = CrearRolesModule.currentRolId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        mostrarNotificacion(data.message || 'Rol guardado exitosamente', 'success');
        cerrarModal();
        cargarRoles(); // Recargar la lista de roles
    } catch (error) {
        console.error('Error guardando rol:', error);
        mostrarNotificacion(error.message || 'Error al guardar el rol', 'error');
    }
}

// Función para eliminar rol
async function eliminarRol(rolId) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Esta acción eliminará el rol ID: ${rolId}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
        const response = await fetch(`${CrearRolesModule.API_ROLES_MANAGE_URL}${rolId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }

        mostrarNotificacion('Rol eliminado exitosamente', 'success');
        cargarRoles(); // Recargar la lista de roles
    } catch (error) {
        console.error('Error eliminando rol:', error);
        mostrarNotificacion(`Error al eliminar rol: ${error.message}`, 'error');
    }
}

// Función para mostrar notificaciones con SweetAlert2
function mostrarNotificacion(mensaje, tipo) {
    Swal.fire({
        title: tipo === 'success' ? 'Éxito' : 'Error',
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Aceptar'
    });
}

// Función para obtener el token CSRF
function getCSRFToken() {
    const cookieValue = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

// Inicialización y eventos
function inicializarModuloRoles() {
    console.log('[Roles] Inicializando módulo de gestión de roles...');

    const checkDOM = () => {
        const tbody = document.querySelector('.tabla-datos__tbody');
        if (!tbody) {
            console.log('[Roles] Elemento principal no disponible, reintentando...');
            setTimeout(checkDOM, 100);
            return;
        }

        console.log('[Roles] Elemento principal encontrado, iniciando...');

        cargarRoles();

        // Eventos
        document.addEventListener('click', function(e) {
            if (e.target.matches('#btn-nuevo-rol')) {
                abrirModalRol();
            }
            if (e.target.closest('.btn-editar')) {
                const rolId = e.target.closest('.btn-editar').dataset.id;
                abrirModalRol(rolId);
            }
            if (e.target.closest('.btn-eliminar')) {
                const rolId = e.target.closest('.btn-eliminar').dataset.id;
                eliminarRol(rolId);
            }
            if (e.target.matches('.btn-cancel')) {
                cerrarModal();
            }
            if (e.target.matches('.btn-close')) {
                cerrarModal();
            }
            if (e.target.matches('.btn-save')) {
                guardarRol();
            }
        });

        // Búsqueda roles
        const searchInput = document.getElementById('search-roles');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                const term = e.target.value.toLowerCase();
                const filteredRoles = CrearRolesModule.roles.filter(rol => 
                    rol.nombre_rol.toLowerCase().includes(term) ||
                    (rol.descripcion && rol.descripcion.toLowerCase().includes(term)) ||
                    (rol.codigo_rol && rol.codigo_rol.toLowerCase().includes(term))
                );
                renderizarRoles(filteredRoles);
            });
        }
    };

    checkDOM();
}

// Exportar funciones globalmente
(function() {
    if (typeof window !== 'undefined') {
        window.inicializarModuloRoles = inicializarModuloRoles;
        window.abrirModalRol = abrirModalRol;
        window.eliminarRol = eliminarRol;

        document.dispatchEvent(new CustomEvent('moduloRolesReady', {
            detail: { ready: true, timestamp: new Date() }
        }));
    }
})();

// Inicializar módulo al cargar el script solo si estamos en la página correcta
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si estamos en la página de crear roles
    if (document.querySelector('.tabla-datos__tbody') || document.querySelector('#btn-nuevo-rol')) {
        inicializarModuloRoles();
    }
});
