document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado y script iniciado");

    // Elementos del DOM
    const modal = document.getElementById('modal-importacion');
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    const btnCerrarModal = document.querySelector('.btn-cerrar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const pasos = document.querySelectorAll('.paso-importacion');
    const indicadoresPasos = document.querySelectorAll('.indicador-pasos .paso');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnImportar = document.getElementById('btn-importar');
    const dropzone = document.getElementById('dropzone-area');
    const inputArchivo = document.getElementById('archivo-nomina-modal');
    const nombreArchivo = document.getElementById('nombre-archivo');
    const btnSeleccionarArchivo = document.getElementById('btn-seleccionar-archivo');
    
    let pasoActual = 1;
    const totalPasos = 4;
    
    // Verificación de elementos
    if (!modal || !btnAbrirModal || !btnCerrarModal || !btnCancelar || 
        !btnAnterior || !btnSiguiente || !btnImportar) {
        console.error("Error: Elementos esenciales no encontrados");
        return;
    }

    // Abrir modal
    btnAbrirModal.addEventListener('click', function() {
        console.log("Abriendo modal de importación");
        modal.style.display = 'flex';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        pasoActual = 1;
        console.log("Estilo del modal:", modal.style.display); // Debería decir "flex"
        actualizarPasos();
    });
    
    // Cerrar modal
    btnCerrarModal.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);
    
    function cerrarModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log("Modal cerrado");
    }
    
    // Navegación entre pasos
    btnSiguiente.addEventListener('click', function() {
        if (validarPasoActual()) {
            pasoActual++;
            actualizarPasos();
        }
    });
    
    btnAnterior.addEventListener('click', function() {
        pasoActual--;
        actualizarPasos();
    });
    
    function actualizarPasos() {
        console.log(`Actualizando a paso ${pasoActual}`);
        
        // Ocultar todos los pasos
        pasos.forEach(paso => paso.classList.remove('activo'));
        
        // Mostrar paso actual
        const pasoActivo = document.querySelector(`.paso-importacion[data-paso="${pasoActual}"]`);
        if (pasoActivo) pasoActivo.classList.add('activo');
        
        // Actualizar indicadores
        indicadoresPasos.forEach((indicador, index) => {
            indicador.classList.toggle('completado', index < pasoActual);
            indicador.classList.toggle('activo', index === pasoActual - 1);
        });
        
        // Actualizar botones
        btnAnterior.disabled = pasoActual === 1;
        btnSiguiente.style.display = pasoActual < totalPasos ? 'flex' : 'none';
        
        // Manejar visibilidad y estado del botón de importar
        if (pasoActual === totalPasos) {
            btnImportar.style.display = 'flex';
            // Validar si todos los campos están completos para habilitar el botón
            btnImportar.disabled = !validarPasoActual();
            actualizarResumen();
        } else {
            btnImportar.style.display = 'none';
        }
    }
    
    function validarPasoActual() {
        let valido = true;
        
        if (pasoActual === 1) {
            const tipoNomina = document.getElementById('modal-tipo-nomina');
            if (!tipoNomina.value) {
                tipoNomina.classList.add('invalido');
                valido = false;
            } else {
                tipoNomina.classList.remove('invalido');
            }
        } else if (pasoActual === 2) {
            const campos = [
                {id: 'modal-mes', valid: v => !!v},
                {id: 'modal-anio', valid: v => v && v >= 2020 && v <= 2030},
                {id: 'modal-secuencia', valid: v => !!v}
            ];
            
            campos.forEach(campo => {
                const element = document.getElementById(campo.id);
                if (!campo.valid(element.value)) {
                    element.classList.add('invalido');
                    valido = false;
                } else {
                    element.classList.remove('invalido');
                }
            });
        } else if (pasoActual === 3) {
            if (!inputArchivo.files?.length) {
                dropzone.style.borderColor = 'var(--color-error)';
                valido = false;
            } else {
                dropzone.style.borderColor = 'var(--color-secundario)';
            }
        }
        
        return valido;
    }
    
    function actualizarResumen() {
        const elementosResumen = {
            'resumen-tipo': () => document.getElementById('modal-tipo-nomina').value,
            'resumen-periodo': () => {
                const mes = document.getElementById('modal-mes');
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const nombreMes = meses[parseInt(mes.value) - 1] || '';
                return `${nombreMes} ${document.getElementById('modal-anio').value} - ${document.getElementById('modal-secuencia').value}`;
            },
            'resumen-archivo': () => inputArchivo.files[0]?.name || 'No seleccionado',
            'resumen-registros': () => '125' // Esto debería calcularse del archivo
        };
        
        Object.entries(elementosResumen).forEach(([id, fn]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = fn();
        });
    }
    
    // Drag and drop para archivos
    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, unhighlight, false);
        });
        
        dropzone.addEventListener('drop', handleDrop, false);
    }
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropzone?.classList.add('highlight');
    }
    
    function unhighlight() {
        dropzone?.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        inputArchivo.files = files;
        handleFiles(files);
    }
    
    inputArchivo?.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    btnSeleccionarArchivo?.addEventListener('click', function() {
        inputArchivo.click();
    });
    
    function handleFiles(files) {
        if (files?.length && nombreArchivo) {
            const file = files[0];
            nombreArchivo.textContent = file.name;
            
            // Validación de tipo y tamaño
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                'text/csv'
            ];
            
            if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
                mostrarError('Tipo de archivo no válido. Solo se aceptan Excel (.xls, .xlsx) o CSV.');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                mostrarError('El archivo es demasiado grande. Máximo 5MB.');
                return;
            }
            
            previsualizarArchivo(file);
        }
    }
    
    function mostrarError(mensaje) {
        console.error(mensaje);
        alert(mensaje); // Reemplazar con tu sistema de notificaciones
    }
    
    function previsualizarArchivo(file) {
        console.log('Previsualizando archivo:', file.name);
        // Implementar lógica de previsualización aquí
    }
    
    // Descargar plantilla
    document.getElementById('descargar-plantilla')?.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Descargando plantilla...');
        // Implementar descarga real aquí
    });
    
    // Importar nómina - SINGLE EVENT LISTENER
    btnImportar.addEventListener('click', function() {
        console.log("Intento de importación");
        
        if (!validarPasoActual()) {
            mostrarError("Por favor complete todos los campos requeridos");
            return;
        }
        
        const formData = new FormData();
        formData.append('tipo_nomina', document.getElementById('modal-tipo-nomina').value);
        formData.append('mes', document.getElementById('modal-mes').value);
        formData.append('anio', document.getElementById('modal-anio').value);
        formData.append('secuencia', document.getElementById('modal-secuencia').value);
        
        if (inputArchivo.files[0]) {
            formData.append('archivo', inputArchivo.files[0]);
        }
        
        console.log("Datos preparados para importación:", Object.fromEntries(formData));
        
        // SIMULACIÓN - reemplazar con llamada real a tu API
        setTimeout(() => {
            console.log("Importación simulada con éxito");
            alert('Nómina importada correctamente (simulación)');
            cerrarModal();
        }, 1000);
        
        /*
        // EJEMPLO DE LLAMADA REAL:
        fetch('/api/importar-nomina', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Importación exitosa');
                cerrarModal();
            } else {
                mostrarError(data.message || "Error al importar");
            }
        })
        .catch(error => {
            mostrarError("Error de conexión: " + error.message);
        });
        */
    });
    
    // Función auxiliar para CSRF (Django)
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
});