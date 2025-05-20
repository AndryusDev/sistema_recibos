document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');

    if (!form) {
        console.error("❌ Formulario 'loginForm' no encontrado.");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        fetch("/login_empleado/", {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Guardar información en sessionStorage
                sessionStorage.setItem('usuario_info', JSON.stringify(data.usuario_info));
                
                // Redirigir al menú
                window.location.href = data.redirect_url;
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al iniciar sesión');
        });
    });
});