// Agregar evento al botón de logout
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
    logoutButton.addEventListener("click", function(e) {
        e.preventDefault();
        
        console.log("🔒 Intentando cerrar sesión...");
        
        fetch('/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Limpiar sessionStorage
                sessionStorage.removeItem("usuario_info");
                
                // Redirigir
                window.location.href = data.redirect_url;
            } else {
                console.error("Error al cerrar sesión:", data.error);
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
}

// Función auxiliar para obtener el token CSRF
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