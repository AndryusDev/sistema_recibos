const usuarioId = window.usuarioId || '';

// JavaScript for cambiar_contrasena.html modal verification

(function() {
    const form = document.getElementById('form-cambiar-contrasena');
    const modal = document.getElementById('modal-verificacion');

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    async function cambiarContrasena() {
        const usuario_id = window.usuarioId || '';

        const currentPassword = document.getElementById('contrasena-actual').value.trim();
        const newPassword = document.getElementById('nueva-contrasena').value.trim();
        const confirmPassword = document.getElementById('confirmar-contrasena').value.trim();

        if (currentPassword === '' || newPassword === '' || confirmPassword === '') {
            alert('Por favor, complete todos los campos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Las nuevas contraseñas no coinciden.');
            return;
        }

        try {
            const response = await fetch('/api/cambiar_contrasena/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    contrasena_actual: currentPassword,
                    nueva_contrasena: newPassword,
                    confirmar_contrasena: confirmPassword,
                    usuario_id: usuario_id
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Contraseña cambiada correctamente.');
                if (modal) {
                    modal.style.display = 'none';
                }
                if (form) {
                    form.reset();
                }
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
            console.error('Error:', error);
        }
    }

    function initCambiarContrasena() {
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        submitButton.type = 'button';

        submitButton.addEventListener('click', function() {
            cambiarContrasena();
        });
    }

    if (typeof window !== 'undefined') {
        window.initCambiarContrasena = initCambiarContrasena;
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('form-cambiar-contrasena')) {
            initCambiarContrasena();
        }
    });
})();
