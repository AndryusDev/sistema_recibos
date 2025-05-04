document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'arc.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de arc cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'arc.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de arc descargado');
    }
});

function arcModal__abrir(anio){
    const modal = document.getElementById("arcModal");
    const contenido = document.getElementById("contenidoArc");

    contenido.innerHTML = `
        <div class="arc-container">
            <div class="arc-header">
                <div class="logo-izquierdo">
                    <img src="/static/image/MinRIntPaz.png" alt="Logo Ministerio" width="80">
                </div>
                <div class="textos-centro__titulo">
                    <h2><strong>POLICÍA BOLIVARIANA DEL ESTADO ANZOÁTEGUI</strong></h2>
                </div>
                <div class="logo-derecho">
                <img src="/static/image/logo_polibanz.png" alt="Logo Policía" width="80">
            </div>
        </div>

        <div class="sub">
            <h3 class="sub_titulo">ARC - AÑO ${anio}</h3>
        </div>
        
        <div class="contenedor-tablas">
            <table class="tabla-modal-arc__agente">
                <thead>
                    <tr>
                        <th>NOMBRE O RAZÓN SOCIAL DEL AGENTE DE RETENCIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>POLICÍA BOLIVARIANA DEL ESTADO ANZOÁTEGUI</td>
                    </tr>
                </tbody>
            </table>
            <table class="tabla-modal-arc__sujeto">
                <thead>
                    <tr>
                        <th>NOMBRE O RAZÓN SOCIAL DEL SUJETO RETENCIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ANDRYUS JOSÉ GUAIQUIRIMA CERMEÑO</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="contenedor-tablas2">
            <table class="tabla-modal-arc__agente__direccion">
                <thead>
                    <tr>
                        <th>DIRECCIÓN DEL AGENTE DE RETENCIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="minimizar">Av. Jorge Rodríguez, Crucero de Lechería, Coordinación Policial G/D <br>
                        Jose Antonio Anzoátegui de la Policía Bolivariana del Estado <br>
                        Anzoátegui</td>
                    </tr>
                </tbody>
            </table>
            <table class="tabla-modal-arc__sujeto__cedula">
                <thead>
                    <tr>
                        <th>NRO. DE CEDULA DEL SUJETO RETENIDO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>30.480.815</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <table class="tabla-arc-detalle">
            <thead>
                <tr>
                    <th>OPER. NRO.</th>
                    <th>Mes</th>
                    <th>Esp</th>
                    <th>Monto Bruto</th>
                    <th>%</th>
                    <th>ISLR Retenido</th>
                    <th>Monto Neto</th>
                    <th>Monto a Declarar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>ENERO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="montoneto-celda">
                        <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>705,52</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>FEBRERO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="montoneto-celda">
                        <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>6.421,54</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>MARZO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior">1</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="montoneto-celda">
                        <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>705,52</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td>ABRIL</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="montoneto-celda">
                        <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>705,52</td>
                </tr>
                <tr>
                    <td>5</td>
                    <td>MAYO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="montoneto-celda">
                        <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>705,52</td>
                </tr>
                <tr>
                    <td>6</td>
                    <td>JUNIO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>JULIO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>AGOSTO</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr>
                    <td>9</td>
                    <td>SEPTIEMBRE</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr>
                    <td>10</td>
                    <td>OCTUBRE</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr>
                    <td>11</td>
                    <td>NOVIEMBRE</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr>
                    <td>12</td>
                    <td>DICIEMBRE</td>
                    <td class="eps-celda">
                        <table class="eps-tabla">
                            <tr><td class="eps-superior">Exento</td></tr>
                            <tr><td class="eps-inferior">Bse Imp</td></tr>
                        </table>
                    </td>
                    <td class="montobruto-celda">
                        <table class="montobruto-tabla">
                            <tr><td class="montobruto-superior">705.52</td></tr>
                            <tr><td class="montobruto-inferior"></td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    <td class="porcentaje-celda">
                        <table class="porcentaje-tabla">
                            <tr><td class="porcentaje-superior">0,00</td></tr>
                            <tr><td class="porcentaje-inferior">%</td></tr>
                        </table>
                    </td>
                    </td>
                        <td class="montoneto-celda">
                            <table class="montoneto-tabla">
                            <tr><td class="montoneto-superior"></td></tr>
                            <tr><td class="montoneto-inferior"></td></tr>
                        </table>
                    </td>
                    <td>0,00</td>
                </tr>
                <tr class="fila-total">
                    <!-- Celda que abarca las primeras 6 columnas -->
                    <td colspan="7" class="total-texto">Total monto a declarar Bs.:</td>
                    
                    <!-- Celda para el monto (debajo de "monto a declarar") -->
                    <td class="total-monto">9.243,62</td>
                </tr>
            </tbody>
        </table>
        <div class="tabla-arc-resumen">
            <table class="tabla-arc-resumen__vacaciones">
                <tr>
                    <th><strong>VACACIONES</strong></th>
                </tr>
                <tr>
                    <td>5.716,02</td>
                </tr>
            </table>
            <table class="tabla-arc-resumen__aguinaldos">
                <tr>
                    <th><strong>AGUINALDOS</strong></th>
                </tr>
                <tr>
                    <td>0,00</td>
                </tr>
            </table>
            <table class="tabla-arc-resumen__evaluacion">
                <tr>
                    <th><strong>EVALUACIÓN</strong></th>
                <tr>
                <tr>
                    <td>0,00</td>
                <tr>
            </table>
            <table class="tabla-arc-resumen__salarios">
                <tr>
                    <th><strong>SALARIOS</strong></th>
                </tr>
                <tr>
                    <td>3.527,60</td>
                </tr>
            </table>
        </div>
        <p class="nota-final">Individuo no trabajador</p>
    </div>
    `;
    modal.style.display = 'flex';
}

function arcModal__cerrar() {
    document.getElementById('arcModal').style.display = 'none';
    }

    function arcModal__imprimir() {
        const contenido = document.getElementById("contenidoArc").innerHTML;
        
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Imprimir ARC</title>
                <style>
                    /* ESTILOS GENERALES */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 5mm;
                        font-size: 10pt;
                        line-height: 1.3;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    /* CONTENEDOR PRINCIPAL */
                    .arc-container {
                        width: 100%;
                        transform: scale(0.95);
                        transform-origin: top center;
                    }
                    
                    /* ENCABEZADO */
                    .arc-header {
                        text-align: center;
                        color: #003366;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    
                    .textos-centro__titulo h2 {
                        text-decoration: underline;
                    }
                    
                    /* TABLAS HORIZONTALES SUPERIORES (MÁS PEQUEÑAS) */
                    .contenedor-tablas, .contenedor-tablas2 {
                        display: flex;
                        justify-content: space-between;
                        gap: 15px;
                        width: 100%;
                        margin-bottom: 10px;
                        align-items: center; /* Centra verticalmente */
                    }
                    
                    .tabla-modal-arc__agente,
                    .tabla-modal-arc__sujeto,
                    .tabla-modal-arc__agente__direccion,
                    .tabla-modal-arc__sujeto__cedula {
                        width: 48% !important;
                        font-size: 8pt !important;
                        border-collapse: collapse;
                        border: 1px solid #000 !important;
                        margin: 0 auto; /* Centrado adicional para tablas */
                    }
                    
                    .tabla-modal-arc__agente th,
                    .tabla-modal-arc__sujeto th,
                    .tabla-modal-arc__agente__direccion th,
                    .tabla-modal-arc__sujeto__cedula th,
                    .tabla-modal-arc__agente td,
                    .tabla-modal-arc__sujeto td,
                    .tabla-modal-arc__agente__direccion td,
                    .tabla-modal-arc__sujeto__cedula td {
                        padding: 4px 6px !important;
                        border: 1px solid #000 !important;
                        text-align: center !important; /* Añade esta línea */
                    }
                    
                    .tabla-modal-arc__agente th,
                    .tabla-modal-arc__sujeto th,
                    .tabla-modal-arc__agente__direccion th,
                    .tabla-modal-arc__sujeto__cedula th {
                        background-color: #f2f2f2 !important;
                        font-weight: bold !important;
                    }
                    .sub_titulo {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    /* TABLA PRINCIPAL CON CELDAS ANIDADAS */
                    .tabla-arc-detalle {
                        width: 100%;
                        font-size: 8pt;
                        border-collapse: collapse;
                        margin: 5px 0 15px 0;
                        table-layout: fixed;
                        text-align: center !important;
                    }
                    
                    .tabla-arc-detalle th, 
                    .tabla-arc-detalle td {
                        padding: 3px;
                        border: 1px solid #000;
                        text-align: center !important;
                    }
                    
                    .tabla-arc-detalle th,
                    .tabla-arc-resumen th {
                        background-color: #006666;
                        color: white;
                        text-align: center !important;
                    }
                    
                    /* ESTILOS PARA CELDAS ANIDADAS (MANTIENE TAMAÑO Y BORDES) */
                    .porcentaje-celda, 
                    .eps-celda, 
                    .montobruto-celda,
                    .montoneto-celda {
                        padding: 0 !important;
                        min-width: 80px !important;
                        height: 100%;
                        position: relative;
                    }
                    
                    .porcentaje-tabla, 
                    .eps-tabla, 
                    .montobruto-tabla,
                    .montoneto-tabla {
                        width: 100% !important;
                        height: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 8pt !important;
                        table-layout: fixed; /* Añadido para consistencia */
                    }
                    
                    .porcentaje-superior, 
                    .porcentaje-inferior, 
                    .eps-superior, 
                    .eps-inferior, 
                    .montobruto-superior, 
                    .montobruto-inferior,
                    .montoneto-superior,
                    .montoneto-inferior {
                        padding: 4px !important;
                        border: none !important;
                        height: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .porcentaje-superior, 
                    .eps-superior, 
                    .montobruto-superior,
                    .montoneto-superior {
                        border-bottom: 1px solid #000 !important;
                    }

                    .montobruto-inferior:empty::after {
                    content: "\\00a0"; /* Espacio invisible cuando está vacío */
                    display: inline-block;
                    width: 100%;
                }
                    
                    /* TABLAS RESUMEN (VACACIONES, SALARIOS, ETC) - CORRECCIONES */
                    .tabla-arc-resumen {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 15px;
                        width: 100%;
                    }
                    
                    .tabla-arc-resumen table {
                        width: 23% !important;
                        border-collapse: collapse;
                        border: 1px solid #000 !important;
                        font-size: 8pt;
                    }
                    
                    .tabla-arc-resumen th,
                    .tabla-arc-resumen td {
                        border: 1px solid #000 !important;
                        padding: 5px !important;
                        text-align: center;
                    }
                    
                    
                    /* AJUSTES PARA IMPRESIÓN */
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 5mm;
                        }
                        
                        body {
                            padding: 0;
                            font-size: 9pt;
                        }
                        
                        .arc-container {
                            transform: none;
                            width: 100%;
                        }
                        
                        .contenedor-tablas, .contenedor-tablas2 {
                            gap: 10px;
                        }
                        
                        .tabla-modal-arc__agente,
                        .tabla-modal-arc__sujeto,
                        .tabla-modal-arc__agente__direccion,
                        .tabla-modal-arc__sujeto__cedula {
                            font-size: 7pt !important;
                        }
                        
                        .tabla-arc-detalle {
                            font-size: 7pt;
                        }
                        
                        .porcentaje-tabla, 
                        .eps-tabla, 
                        .montobruto-tabla,
                        .montoneto-tabla {
                            font-size: 7pt !important;
                        }
                        
                        table {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="arc-container">
                    ${contenido}
                </div>
                <script>
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 400);
                </script>
            </body>
            </html>
        `);
        ventana.document.close();
    }