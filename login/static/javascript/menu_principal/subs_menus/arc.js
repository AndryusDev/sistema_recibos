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

        <div>
            <h3 class="sub_titulo">ARC - AÑO ${anio}</h3>
        </div>

        <br>

        <table class="tabla-modal-arc">
            <tr>
                <td><strong>NOMBRE O RAZÓN SOCIAL DEL AGENTE DE RETENCIÓN:</strong><br>POLICÍA BOLIVARIANA DEL ESTADO ANZOÁTEGUI</td>
                <td><strong>NOMBRE O RAZÓN SOCIAL DEL SUJETO RETENIDO:</strong><br>SORELYS DEL VALLE MAIGUA DÍAZ</td>
            </tr>
            <tr>
                <td colspan="2"><strong>DIRECCIÓN DEL AGENTE DE RETENCIÓN:</strong><br>Av. Jorge Rodríguez, Crucero de Lechería, Coordinación Policial G/D José Antonio Anzoátegui de la Policía Bolivariana del Estado Anzoátegui</td>
            </tr>
            <tr>
                <td colspan="2"><strong>NRO. DE CÉDULA DEL SUJETO RETENIDO:</strong> 8260027</td>
            </tr>
        </table>

        <br>

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
            </tbody>
        </table>

        <p class="total-declarar">Total monto a declarar Bs.: 9.243,62</p>

        <table class="tabla-arc-resumen">
            <tr>
                <td><strong>VACACIONES</strong><br>5.716,02</td>
                <td><strong>AGUINALDOS</strong><br>0,00</td>
                <td><strong>EVALUACIÓN</strong><br>0,00</td>
                <td><strong>SALARIOS</strong><br>3.527,60</td>
            </tr>
        </table>

        <p class="nota-final">Individuo no trabajador</p>
    </div>
    `;
    modal.style.display = 'flex';
}

function arcModal__cerrar() {
    document.getElementById('arcModal').style.display = 'none';
    }