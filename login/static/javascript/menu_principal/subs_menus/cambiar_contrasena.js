const usuarioId = window.usuarioId || '';

// JavaScript for cambiar_contrasena.html modal verification

async function cambiarContrasena(usuario) {
    const usuario_id = window.usuarioId || '';
    console.log(usuario)
    console.log(usuario_id)

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
            document.getElementById('modal-verificacion').style.display = 'none';
            document.getElementById('form-cambiar-contrasena').reset();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
        console.error('Error:', error);
    }
}

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
