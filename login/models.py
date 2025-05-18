from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class rol(models.Model):

    codigo_rol = models.IntegerField(unique=True, primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True,)
    descripcion = models.TextField(blank=True)
    class Meta:
        db_table = 'rol'
    

class pregunta_seguridad(models.Model):
    """Modelo para el catálogo de preguntas de seguridad"""
    pregunta = models.TextField(unique=True)
    activa = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'preguntas_seguridad'
        verbose_name_plural = 'Preguntas de seguridad'
    
    def __str__(self):
        return self.pregunta[:50] + "..." if len(self.pregunta) > 50 else self.pregunta

class empleado(models.Model):
    TIPO_IDENTIFICACION = [
        ('V', 'Venezolano'),
        ('E', 'Extranjero'),
        ('P', 'Pasaporte'),
    ]
    tipo_identificacion = models.CharField(max_length=1, choices=TIPO_IDENTIFICACION)
    cedula = models.CharField(max_length=20, primary_key=True)
    primer_nombre = models.CharField(max_length=50)
    primer_apellido = models.CharField(max_length=50)
    segundo_nombre = models.CharField(max_length=50)
    segundo_apellido = models.CharField(max_length=50)
    # ... otros campos
    
    class Meta:
        db_table = 'empleados'

class usuario(models.Model):
    """Modelo de usuarios del sistema"""
    id = models.AutoField(primary_key=True)
    empleado = models.ForeignKey("empleado",  # Asume que tienes una app 'empleados' con modelo Empleado
        on_delete=models.CASCADE,
        db_column='empleado_cedula',
        to_field='cedula'
    )
    email = models.EmailField(unique=True)
    contraseña_hash = models.CharField(max_length=128)
    ultimo_login = models.DateTimeField(null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'usuarios'
    
    def set_password(self, raw_password):
        """Guardar contraseña sin hash (solo para pruebas)"""
        self.contraseña_hash = raw_password  # ← No la está cifrando

    def check_password(self, raw_password):
        """Comparación directa de contraseña (solo para pruebas)"""
        return self.contraseña_hash == raw_password  # ← Comparación directa

    def __str__(self):
        return f"{self.email} ({self.empleado})"
    

class usuario_rol(models.Model):
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(rol, on_delete=models.CASCADE)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usuario_roles'
        unique_together = (('usuario', 'rol'),)  # Clave única compuesta (equivalente a PK compuesta)
    
    def __str__(self):
        return f"Usuario {self.usuario_id} → Rol {self.rol_id}"

class usuario_pregunta(models.Model):
    """Relación entre usuarios y sus preguntas de seguridad"""
    usuario = models.ForeignKey(
        usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        to_field='id'
    )
    pregunta = models.ForeignKey(
        pregunta_seguridad,
        on_delete=models.CASCADE,
        db_column='pregunta_id'
    )
    respuesta_hash = models.CharField(max_length=128)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'usuario_preguntas'
        unique_together = (('usuario', 'pregunta'),)
        verbose_name = 'Pregunta de usuario'
        verbose_name_plural = 'Preguntas de usuarios'
    
    def set_respuesta(self, respuesta):
        """Hashea la respuesta"""
        self.respuesta_hash = make_password(respuesta)
    
    def check_respuesta(self, respuesta):
        """Verifica la respuesta"""
        return check_password(respuesta, self.respuesta_hash)
    
    def __str__(self):
        return f"{self.usuario} - {self.pregunta}"
    

    #carga nomina

class tipo_nomina(models.Model):
    codigo_tiponomina = models.IntegerField(unique=True, primary_key=True)
    tipo_nomina = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'tipo_nomina'  # puedes personalizarlo o eliminar esta línea

    def __str__(self):
        return self.tipo_nomina

class meses(models.Model):
    id_mes = models.IntegerField(primary_key=True)
    nombre_mes = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = 'meses'
        ordering = ['id_mes']

    def __str__(self):
        return self.nombre_mes

class secuencia(models.Model):
    id_secuencia = models.IntegerField(primary_key=True)
    nombre_secuencia =models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = 'secuencia'
        ordering = ['id_secuencia']

    def __str__(self):
        return self.nombre_secuencia
    
class tipo_trabajador(models.Model):
    codigo_trabajador = models.IntegerField(primary_key=True)
    descripcion = models.CharField(max_length=100)

    class Meta:
        db_table = 'tipo_trabajador'

    def __str__(self):
        return self.descripcion

class tipo_pago(models.Model):
    codigo_tipopago = models.IntegerField(primary_key=True)
    nombre_tipopago= models.CharField(max_length=100)
    abreviatura_excel_tipopago = models.CharField(max_length=20)

    class Meta:
        db_table = 'tipo_pago'

    def __str__(self):
        return self.nombre_tipopago
    
class concepto_pago(models.Model):
    codigo = models.CharField(primary_key=True, unique=True)
    descripcion = models.CharField(max_length=255)
    tipo_pago = models.ForeignKey(tipo_pago, on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    tipo_concepto_choices = [
        ('ASIGNACION', 'Asignación'),
        ('DEDUCCION', 'Deducción'),
    ]
    tipo_concepto = models.CharField(max_length=20, choices=tipo_concepto_choices)
    nombre_nomina = models.CharField(max_length=255)

    class Meta:
        db_table = 'concepto_pago'

    def __str__(self):
        return f"{self.codigo} - {self.descripcion}"
    
class concepto_tipotrabajador(models.Model):
    codigo = models.ForeignKey(concepto_pago, on_delete=models.CASCADE)
    tipo_trabajador = models.ForeignKey(tipo_trabajador, on_delete=models.CASCADE)

    class Meta:
        db_table = 'concepto_tipotrabajador'

class mes_aplicacionconcepto(models.Model):
    codigo = models.ForeignKey(concepto_pago, on_delete=models.CASCADE)
    meses = models.ForeignKey(meses, on_delete=models.CASCADE)

    class Meta:
        db_table = 'mes_aplicacionconcepto'

#   <----------codigo importar documento -------------------->

from django.db import models


class nomina(models.Model):
    id_nomina =  models.AutoField(primary_key=True, unique=True)
    tipo_nomina = models.ForeignKey(tipo_nomina, on_delete=models.CASCADE)
    periodo = models.CharField(max_length=255)
    secuencia = models.ForeignKey(secuencia, on_delete=models.PROTECT)
    fecha_cierre = models.DateField()
    fecha_carga = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'nomina'

class detalle_nomina(models.Model):
    nomina = models.ForeignKey(nomina, on_delete=models.PROTECT)
    cedula = models.ForeignKey(empleado, on_delete=models.PROTECT)
    codigo = models.ForeignKey(concepto_pago, on_delete=models.PROTECT)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    pdf = models.FileField(upload_to='recibos/')
    
    class Meta:
        verbose_name = "Detalle de Nomina"
        verbose_name_plural = "Detalles de Nomina"
        db_table = "detalle_nomina"

class recibo_pago(models.Model):
    nomina = models.ForeignKey(nomina, on_delete=models.PROTECT)
    cedula = models.ForeignKey(empleado, on_delete=models.PROTECT)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    pdf = models.FileField(upload_to='recibos/%Y/%m/')
# Relación a los conceptos
    
    class Meta:
        db_table = 'recibo_pago'
    
    def get_detalles(self):
        """Obtiene todos los detalles agrupados por tipo"""
        detalles = self.detalle_recibo_set.all().select_related('detalle_nomina__codigo__tipo_pago')

        asignaciones = [
            d.detalle_nomina for d in detalles
            if d.detalle_nomina.codigo.tipo_pago.nombre_tipopago.upper() == 'ASIGNACION'
        ]
        deducciones = [
            d.detalle_nomina for d in detalles
            if d.detalle_nomina.codigo.tipo_pago.nombre_tipopago.upper() == 'DEDUCCION'
        ]

        total_asignaciones = sum(d.monto for d in asignaciones)
        total_deducciones = sum(d.monto for d in deducciones)

        return {
            'asignaciones': asignaciones,
            'deducciones': deducciones,
            'totales': {
                'asignaciones': total_asignaciones,
                'deducciones': total_deducciones,
                'neto': total_asignaciones - total_deducciones
            }
        }

    def __str__(self):
        return f"Recibo {self.nomina} - {self.cedula}"

class detalle_recibo(models.Model):
    recibo = models.ForeignKey(recibo_pago, on_delete=models.CASCADE)
    detalle_nomina = models.OneToOneField(detalle_nomina, on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'detalle_recibo'
    
    def __str__(self):
        return f"Detalle {self.detalle_nomina} en {self.recibo}"


"""class LineaRecibo(models.Model):
    recibo = models.ForeignKey(ReciboPago, on_delete=models.CASCADE, related_name='lineas')
    concepto = models.ForeignKey(ConceptoNomina, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=1, choices=[('I', 'Ingreso'), ('D', 'Deducción')])"""