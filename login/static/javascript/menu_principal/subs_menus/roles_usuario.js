// users.js
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentEditingUserId = null;
    const modal = document.getElementById('edit-user-modal');
    const editForm = document.getElementById('edit-user-form');
    
    // Abrir modal al hacer clic en botón Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            currentEditingUserId = row.dataset.userId; // Asume que agregaste data-user-id a cada fila
            
            // Obtener datos del usuario (en un caso real, harías una petición AJAX)
            const userData = {
                name: row.querySelector('td:nth-child(1) span').textContent.trim(),
                email: row.querySelector('td:nth-child(2)').textContent.trim(),
                role: row.querySelector('.badge').textContent.trim(),
                status: row.querySelector('td:nth-child(4) .badge').textContent.trim()
            };
            
            // Llenar el formulario
            document.getElementById('edit-user-name').value = userData.name;
            document.getElementById('edit-user-email').value = userData.email;
            document.getElementById('edit-user-role').value = getRoleIdByName(userData.role);
            
            // Cargar permisos del rol seleccionado
            loadRolePermissions(document.getElementById('edit-user-role').value);
            
            // Mostrar modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Cerrar modal
    modal.querySelector('.btn-close').addEventListener('click', closeModal);
    modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
    
    // Cambiar permisos cuando cambia el rol
    document.getElementById('edit-user-role').addEventListener('change', function() {
        loadRolePermissions(this.value);
    });
    
    // Guardar cambios
    modal.querySelector('.btn-save').addEventListener('click', function() {
        if (editForm.checkValidity()) {
            saveUserChanges();
        } else {
            editForm.reportValidity();
        }
    });
    
    // Funciones auxiliares
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        editForm.reset();
        currentEditingUserId = null;
    }
    
    function getRoleIdByName(roleName) {
        // En una implementación real, esto vendría de tu base de datos
        const roles = {
            'Administrador': 1,
            'Consultor': 2,
            'Funcionario': 3
        };
        return roles[roleName] || '';
    }
    
    function loadRolePermissions(roleId) {
        const container = document.getElementById('role-permissions-container');
        container.innerHTML = '<p class="loading-text">Cargando permisos...</p>';
        
        // Simulación de carga de permisos (en realidad sería una petición AJAX)
        setTimeout(() => {
            const permissions = getPermissionsByRoleId(roleId);
            
            if (permissions.length > 0) {
                container.innerHTML = '';
                permissions.forEach(perm => {
                    const badge = document.createElement('span');
                    badge.className = 'permission-badge';
                    badge.textContent = perm;
                    container.appendChild(badge);
                });
            } else {
                container.innerHTML = '<p class="no-permissions">Este rol no tiene permisos asignados</p>';
            }
        }, 500);
    }
    
    function getPermissionsByRoleId(roleId) {
        // Simulación - en realidad esto vendría de tu backend
        const permissionsByRole = {
            1: ['ver_todo', 'editar_todo', 'eliminar_todo', 'gestionar_usuarios'],
            2: ['ver_nominas', 'ver_recibos', 'generar_reportes'],
            3: ['ver_mis_recibos', 'ver_mis_datos']
        };
        return permissionsByRole[roleId] || [];
    }
    
    function saveUserChanges() {
        const formData = {
            userId: currentEditingUserId,
            email: document.getElementById('edit-user-email').value,
            roleId: document.getElementById('edit-user-role').value,
            password: document.getElementById('edit-user-password').value
        };
        
        // Aquí iría tu lógica para enviar los datos al servidor
        console.log('Datos a guardar:', formData);
        
        // Simulación de guardado
        alert('Cambios guardados exitosamente!');
        closeModal();
        
        // En una implementación real, actualizarías la tabla después de guardar
        // location.reload(); o actualización dinámica
    }
});