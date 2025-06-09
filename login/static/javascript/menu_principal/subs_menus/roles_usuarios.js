// ===== CONSTANTES GLOBALES =====
const API_USUARIOS_URL = '/api/usuarios/';
const API_ROLES_URL = '/api/roles/';


// ===== FUNCIONES PRINCIPALES =====

async function testAPI() {
    try {
        const response = await fetch(API_USUARIOS_URL);
        const data = await response.json();
        console.log("Respuesta de la API:", data);
        return data;
    } catch (error) {
        console.error("Error al conectar con la API:", error);
        return null;
    }
}

// Llama esta función al inicio para verificar
testAPI().then(data => {
    if (!data) {
        mostrarNotificacion("Error al conectar con el servidor", "error");
    }
});

// Función para cargar y mostrar la lista de usuarios
async function cargarUsuarios(filtro = 'all', pagina = 1) {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    const loadingIndicator = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</td></tr>';
    
    tbody.innerHTML = loadingIndicator;
    
    try {
        // Construir parámetros de búsqueda
        const params = new URLSearchParams({
            page: pagina,
            rol: filtro === 'all' ? '' : filtro,
            // Puedes añadir más parámetros según los filtros que tengas
        });
        
        const response = await fetch(`${API_USUARIOS_URL}?${params.toString()}`, {
            headers: {
                'X-CSRFToken': CSRF_TOKEN,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.usuarios && data.usuarios.length > 0) {
            // Actualizar la tabla con los datos
            tbody.innerHTML = data.usuarios.map(usuario => `
                <tr class="tabla-recibos__fila" data-id="${usuario.id}">
                    <td class="tabla-recibos__celda">
                        <div class="user-avatar">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || '')}&background=random" alt="${usuario.nombre || ''}">
                        </div>
                        <span>${usuario.nombre || 'Sin nombre'}</span>
                    </td>
                    <td class="tabla-recibos__celda">${usuario.email || ''}</td>
                    <td class="tabla-recibos__celda">
                        <span class="badge rol-${usuario.rol?.codigo || ''}">
                            ${usuario.rol?.nombre || 'Sin rol'}
                        </span>
                    </td>
                    <td class="tabla-recibos__celda">
                        <span class="badge ${usuario.activo ? 'badge-success' : 'badge-danger'}">
                            ${usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="tabla-recibos__celda">
                        ${usuario.ultimo_login || 'Nunca'}
                    </td>
                    <td class="tabla-recibos__celda">
                        <button class="btn-action btn-edit" title="Editar" onclick="abrirModalEditarUsuario(${usuario.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarUsuario(${usuario.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios</td></tr>';
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center error">Error al cargar usuarios: ${error.message}</td></tr>`;
    }
}

// Función para abrir el modal de edición de usuario
async function abrirModalEditarUsuario(idUsuario) {
    const modal = document.getElementById('edit-user-modal');
    const titulo = document.getElementById('modal-title');
    const form = document.getElementById('edit-user-form');
    
    // Configurar el modal para edición
    titulo.textContent = idUsuario ? 'Editar Usuario' : 'Nuevo Usuario';
    modal.setAttribute('data-user-id', idUsuario || '');
    
    try {
        if (idUsuario) {
            // Cargar datos del usuario
            const response = await fetch(`${API_USUARIOS_URL}${idUsuario}/`, {
                headers: {
                    'X-CSRFToken': CSRF_TOKEN,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const usuario = await response.json();
            
            // Llenar el formulario
            document.getElementById('edit-user-name').value = usuario.nombre || '';
            document.getElementById('edit-user-email').value = usuario.email || '';
            
            // Cargar roles y seleccionar el actual
            await cargarRolesSelect(usuario.rol?.codigo);
        } else {
            // Nuevo usuario - limpiar formulario
            form.reset();
            await cargarRolesSelect();
        }
        
        // Mostrar el modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        mostrarNotificacion(`Error al cargar usuario: ${error.message}`, 'error');
    }
}

// Función para cargar los roles en el select
async function cargarRolesSelect(rolSeleccionado = null) {
    const select = document.getElementById('edit-user-role');
    
    try {
        const response = await fetch(API_ROLES_URL, {
            headers: {
                'X-CSRFToken': CSRF_TOKEN,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        select.innerHTML = '<option value="">Seleccionar rol...</option>';
        
        if (data.success && data.roles && data.roles.length > 0) {
            data.roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.codigo_rol;
                option.textContent = rol.nombre_rol;
                if (rolSeleccionado && rol.codigo_rol == rolSeleccionado) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        mostrarNotificacion(`Error al cargar roles: ${error.message}`, 'error');
    }
}

// Función para guardar los cambios del usuario
async function guardarUsuario(idUsuario) {
    const form = document.getElementById('edit-user-form');
    const btnGuardar = document.getElementById('btn-guardar-usuario');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const datos = {
        email: document.getElementById('edit-user-email').value,
        rol: document.getElementById('edit-user-role').value,
        password: document.getElementById('edit-user-password').value || undefined
    };
    
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const response = await fetch(idUsuario ? `${API_USUARIOS_URL}${idUsuario}/` : API_USUARIOS_URL, {
            method: idUsuario ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify(datos)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }
        
        const resultado = await response.json();
        mostrarNotificacion(resultado.message || 'Operación exitosa', 'success');
        cerrarModalUsuario();
        await cargarUsuarios(document.getElementById('filtro-rol').value);
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        mostrarNotificacion(`Error al guardar usuario: ${error.message}`, 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar Cambios';
    }
}

// Función para eliminar un usuario
async function eliminarUsuario(idUsuario) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Esta acción eliminará al usuario ID: ${idUsuario}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!confirmacion.isConfirmed) return;
    
    try {
        const btn = document.querySelector(`.btn-delete[onclick="eliminarUsuario(${idUsuario})"]`);
        if (btn) btn.disabled = true;
        
        const response = await fetch(`${API_USUARIOS_URL}${idUsuario}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': CSRF_TOKEN
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        mostrarNotificacion(data.message || 'Usuario eliminado', 'success');
        await cargarUsuarios(document.getElementById('filtro-rol').value);
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        mostrarNotificacion(`Error al eliminar usuario: ${error.message}`, 'error');
    }
}

// Función para cerrar el modal
function cerrarModalUsuario() {
    document.getElementById('edit-user-modal').style.display = 'none';
}

// ===== FUNCIONES AUXILIARES =====

function mostrarNotificacion(mensaje, tipo) {
    Swal.fire({
        title: tipo === 'success' ? 'Éxito' : 'Error',
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Aceptar'
    });
}

// ===== INICIALIZACIÓN =====

// ===== INICIALIZACIÓN =====
function inicializarModuloUsuarios() {
    console.log('[RolesUsuarios] Inicializando módulo de gestión de usuarios...');
    
    const checkDOM = () => {
        const tbody = document.getElementById('cuerpo-tabla-usuarios');
        if (!tbody) {
            console.log('[RolesUsuarios] Elemento principal no disponible, reintentando...');
            setTimeout(checkDOM, 100);
            return;
        }

        console.log('[RolesUsuarios] Elemento principal encontrado, iniciando...');
        
        // Cargar datos iniciales
        cargarUsuarios();
        
        // Configurar eventos
        const setupEventos = () => {
            // Filtro de roles
            document.addEventListener('change', function(e) {
                if (e.target && e.target.id === 'filtro-rol') {
                    cargarUsuarios(e.target.value);
                }
            });
            
            // Botón de búsqueda
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'btn-buscar-usuarios') {
                    const busqueda = document.querySelector('.search-box input')?.value;
                    cargarUsuarios('all', 1, busqueda);
                }
            });
            
            // Modal eventos
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'btn-cerrar-modal') {
                    cerrarModalUsuario();
                }
                if (e.target && e.target.id === 'btn-cancelar-edicion') {
                    cerrarModalUsuario();
                }
                if (e.target && e.target.id === 'btn-guardar-usuario') {
                    const idUsuario = document.getElementById('edit-user-modal')?.getAttribute('data-user-id') || null;
                    guardarUsuario(idUsuario);
                }
            });
        };
        
        setupEventos();
    };
    
    checkDOM();
}

// ===== EXPOSICIÓN DE FUNCIONES =====
(function() {
    // Solo exponer las funciones si window está definido (entorno de navegador)
    if (typeof window !== 'undefined') {
        console.log("[RolesUsuarios] Exportando funciones al ámbito global");
        
        // Exportar funciones principales
        window.inicializarModuloUsuarios = inicializarModuloUsuarios;
        window.abrirModalEditarUsuario = abrirModalEditarUsuario;
        window.eliminarUsuario = eliminarUsuario;

        console.log("[RolesUsuarios] Funciones exportadas correctamente:", {
            inicializarModuloUsuarios: typeof window.inicializarModuloUsuarios,
            abrirModalEditarUsuario: typeof window.abrirModalEditarUsuario,
            eliminarUsuario: typeof window.eliminarUsuario
        });

        // Disparar evento cuando el módulo esté listo
        document.dispatchEvent(new CustomEvent('moduloUsuariosReady', {
            detail: { ready: true, timestamp: new Date() }
        }));
    }
})();