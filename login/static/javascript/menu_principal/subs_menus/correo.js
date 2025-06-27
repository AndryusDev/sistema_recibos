const usuarioId = window.usuarioId || '';

// JavaScript for cambiar_correo.html modal verification

(function() {
    // Private variables and functions
    const form = document.getElementById('form-cambiar-correo');
    const modal = document.getElementById('modal-verificacion');
    const closeModalBtn = document.getElementById('close-modal');
    const verifyBtn = document.getElementById('btn-verificar');
    const codeInput = document.getElementById('codigo-verificacion');
    const errorDiv = document.getElementById('error-codigo');

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

    function initCorreoJS() {
        if (!form) return; // Exit if form not present

        // Change event handling: use button click instead of form submit
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        submitButton.type = 'button'; // Change button type to prevent default form submit

        submitButton.addEventListener('click', function(event) {
            // No need to preventDefault since button type is 'button'

            // Basic validation for matching emails
            const email = document.getElementById('nuevo-correo').value.trim();
            const confirmEmail = document.getElementById('confirmar-correo').value.trim();

            if (email === '' || confirmEmail === '') {
                alert('Por favor, complete ambos campos de correo.');
                return;
            }

            if (email !== confirmEmail) {
                alert('Los correos electrónicos no coinciden.');
                return;
            }

            // Send new email to backend API to update
            if (!usuarioId) {
                alert('Error: Usuario no autenticado. Por favor inicie sesión.');
                return;
            }
            console.log('Sending cambiar_correo request with usuarioId:', usuarioId);
            fetch('/api/cambiar_correo/', {  // Reverted URL to include trailing slash
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                credentials: 'same-origin',
                body: JSON.stringify({ email: email, usuario_id: usuarioId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Instead of showing modal, show success alert and reset form
                    alert('Correo actualizado correctamente. Por favor, verifica tu nuevo correo.');
                    form.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                alert('Error al conectar con el servidor.');
                console.error('Error:', error);
            });
        });

        // Close modal handler
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Verify code handler (currently unused, can be removed or extended)
        if (verifyBtn) {
            verifyBtn.addEventListener('click', function() {
                const code = codeInput.value.trim();

                if (code === '') {
                    errorDiv.textContent = 'Por favor, ingrese el código de verificación.';
                    errorDiv.style.display = 'block';
                    return;
                }

                // Simulate verification logic
                if (code === '123456') { // Example correct code
                    alert('Código verificado correctamente. El correo ha sido actualizado.');
                    modal.style.display = 'none';
                    form.reset();
                } else {
                    errorDiv.textContent = 'Código incorrecto. Intente de nuevo.';
                    errorDiv.style.display = 'block';
                }
            });
        }

        // Optional: Close modal when clicking outside modal content
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }

    // Expose the init function globally
    if (typeof window !== 'undefined') {
        window.initCorreoJS = initCorreoJS;
    }

    // Auto-initialize if the form is present on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('form-cambiar-correo')) {
            initCorreoJS();
        }
    });
})();
