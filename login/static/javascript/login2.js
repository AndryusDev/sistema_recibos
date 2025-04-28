document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);

        fetch("/login_empleado/", {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);  // Muestra el mensaje de éxito
                window.location.href = data.redirect_url;  // Redirige usando la URL del backend
            } else {
                alert(data.error || '❌ Error desconocido.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('⚠ Error del servidor. Intenta más tarde.');
        });
    });
});
