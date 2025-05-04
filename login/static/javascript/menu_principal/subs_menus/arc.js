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