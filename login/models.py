from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.db.models import Sum


class rol(models.Model):

    codigo_rol = models.IntegerField(unique=True, primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True,)
    descripcion = models.TextField(blank=True)
    class Meta:
        db_table = 'rol'
    
class permiso(models.Model):
    codigo = models.CharField(max_length=50, unique=True, primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    class Meta:
        db_table = 'permisos'

    def __str__(self):
        return self.nombre
    
class rol_permisos(models.Model):
    rol = models.ForeignKey("rol", on_delete=models.CASCADE)  # Usar comillas para evitar el NameError
    permiso = models.ForeignKey("permiso", on_delete=models.CASCADE)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rol_permisos"
        unique_together = (("rol", "permiso"),)

class pregunta_seguridad(models.Model):
    """Modelo para el catálogo de preguntas de seguridad"""
    pregunta = models.TextField(unique=True)
    activa = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'preguntas_seguridad'
        verbose_name_plural = 'Preguntas de seguridad'
    
    def __str__(self):
        return self.pregunta[:50] + "..." if len(self.pregunta) > 50 else self.pregunta
    
class tipo_trabajador(models.Model):
    codigo_trabajador = models.IntegerField(primary_key=True)
    descripcion = models.CharField(max_length=100)

    class Meta:
        db_table = 'tipo_trabajador'

class nivel_cargo(models.Model):
    NIVELES = [
        ('I', 'I'),
        ('II', 'II'),
        ('III', 'III'),
        ('IV', 'IV'),
        ('V', 'V'),
        ('VI', 'VI'),
        ('JEFE', 'Jefe'),
    ]
    
    nivel = models.CharField(max_length=10, choices=NIVELES, unique=True, primary_key=True)
    nombre = models.CharField(max_length=50)
    orden_jerarquico = models.PositiveSmallIntegerField(unique=True)
    
    class Meta:
        db_table = 'niveles_cargo'
        verbose_name_plural = 'Niveles de cargo'
        ordering = ['orden_jerarquico']
    
    def __str__(self):
        return f"Nivel {self.get_nivel_display()}"
    

class familia_cargo(models.Model):
    codigo_familiacargo = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=100)
    tipo_trabajador = models.ForeignKey(tipo_trabajador, on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'familias_cargo'
        verbose_name_plural = 'Familias de cargo'
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.tipo_trabajador})"
    

class cargo(models.Model):
    # Identificador único (relación compuesta familia + nivel)
    familia = models.ForeignKey(
        familia_cargo,
        on_delete=models.PROTECT,
        related_name='cargos'
    )
    
    nivel = models.ForeignKey(
        nivel_cargo,
        on_delete=models.PROTECT,  # Impide la eliminación pero permite cambios en el nivel
        related_name='cargos'
    )
    
    # Atributos específicos del cargo
    """sueldo_base = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Sueldo base"
    )"""
    
    activo = models.BooleanField(default=True)
    
    # Metadata
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cargos'
        verbose_name = 'Cargo'
        verbose_name_plural = 'Cargos'
        ordering = ['familia', 'nivel__orden_jerarquico']
        unique_together = [('familia', 'nivel')]  # Un cargo único por combinación familia-nivel
    
    def __str__(self):
        return self.nombre_completo or "Cargo sin nombre"

    
    @property
    def codigo(self):
        """Genera código dinámico: FAMILIA-NIVEL"""
        return f"{self.familia.codigo_familiacargo}-{self.nivel.orden_jerarquico}"
    
    @property
    def nombre_completo(self):
        """Genera nombre dinámico: NOMBRE_FAMILIA + NIVEL"""
        return f"{self.familia.nombre} {self.nivel.nivel}"
    
    @property
    def nombre_base(self):
        """Para compatibilidad si necesitas este campo"""
        return self.familia.nombre

class banco(models.Model):
    codigo = models.CharField(max_length=10, unique=True, primary_key=True)
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'bancos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class cuenta_bancaria(models.Model):
    TIPOS_CUENTA = [
        ('C', 'Corriente'),
        ('A', 'Ahorro'),
    ]

    empleado = models.ForeignKey(
        'empleado',  # usar string si el modelo aún no ha sido declarado
        on_delete=models.CASCADE,
        related_name='cuentas_bancarias'
    )
    banco = models.ForeignKey(
        banco,
        on_delete=models.PROTECT,
        related_name='cuentas'
    )
    tipo = models.CharField(
        max_length=1,
        choices=TIPOS_CUENTA,
        default='C'
    )
    numero_cuenta = models.CharField(
        max_length=20, unique=True
    )
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'cuentas_bancarias'
        verbose_name_plural = 'Cuentas bancarias'
        unique_together = ('banco', 'numero_cuenta')

    def __str__(self):
        return f"{self.empleado} - {self.banco} ({self.get_tipo_display()}) {self.numero_cuenta}"

    
class empleado(models.Model):
    TIPO_IDENTIFICACION = [
        ('V', 'Venezolano'),
        ('E', 'Extranjero'),
        ('P', 'Pasaporte'),
    ]
    
    ESTADO_CIVIL = [
        ('S', 'Soltero/a'),
        ('C', 'Casado/a'),
        ('D', 'Divorciado/a'),
        ('V', 'Viudo/a'),
    ]
    
    GENERO = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]

    # Identificación
    tipo_identificacion = models.CharField(max_length=1, choices=TIPO_IDENTIFICACION)
    cedula = models.IntegerField(primary_key=True, unique=True)
    
    # Nombres
    primer_nombre = models.CharField(max_length=50)
    segundo_nombre = models.CharField(max_length=50, blank=True, null=True)
    primer_apellido = models.CharField(max_length=50)
    segundo_apellido = models.CharField(max_length=50, blank=True, null=True)
    
    # Datos personales
    fecha_nacimiento = models.DateField(null=True, blank=True)
    lugar_nacimiento = models.CharField(max_length=100, blank=True, null=True)
    genero = models.CharField(max_length=1, choices=GENERO, blank=True, null=True)
    estado_civil = models.CharField(max_length=1, choices=ESTADO_CIVIL, blank=True, null=True)
    
    # Información laboral
    fecha_ingreso = models.DateField(default=timezone.now)  # Obligatorio para calcular antigüedad
    cargo = models.ForeignKey(cargo, on_delete=models.PROTECT)
    tipo_trabajador = models.ForeignKey(tipo_trabajador, on_delete=models.PROTECT)
    #sueldo_base = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.BooleanField(default=True)  # Activo/Inactivo
    
    # Información bancaria
    
    # Contacto
    telefono_principal = models.CharField(max_length=20, blank=True, null=True)
    telefono_secundario = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True, unique=True)
    direccion = models.TextField(blank=True, null=True)
    
    # Beneficios (para PRM)
    hijos = models.PositiveIntegerField(default=0)  # Para PRM por hijo
    conyuge = models.BooleanField(default=False)  # Para asignaciones familiares
    
    # Información adicional
    rif = models.CharField(max_length=20, blank=True, null=True, unique=True)
    grado_instruccion = models.CharField(max_length=50, blank=True, null=True)
    
    # Auditoría
    actualizado_en = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'empleados'
        verbose_name = 'Empleado'
        verbose_name_plural = 'Empleados'
        ordering = ['primer_apellido', 'primer_nombre']

    def __str__(self):
        return f"{self.get_nombre_completo()} - {self.cedula}"
    
    def get_nombre_completo(self):
        nombres = f"{self.primer_nombre} {self.segundo_nombre or ''}".strip()
        apellidos = f"{self.primer_apellido} {self.segundo_apellido or ''}".strip()
        return f"{apellidos} {nombres}"
    
    def get_antiguedad(self):
        from dateutil.relativedelta import relativedelta
        from django.utils import timezone
        
        hoy = timezone.now().date()
        delta = relativedelta(hoy, self.fecha_ingreso)
        return f"{delta.years} años, {delta.months} meses y {delta.days} días"
    
    @property
    def nombre_completo(self):
        return self.get_nombre_completo()

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
    rol = models.ForeignKey(rol, on_delete=models.PROTECT)
    
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
    concepto = models.ForeignKey(
        concepto_pago,
        on_delete=models.CASCADE,
        db_column='codigo',  # Esto asegura que use la columna correcta
        to_field='codigo'    # Esto especifica explícitamente qué campo referenciar
    )
    tipo_trabajador = models.ForeignKey(
        tipo_trabajador,
        on_delete=models.CASCADE,
        db_column='tipo_trabajador_id'  # Asegúrate que coincida con tu DB
    )

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
    nomina = models.ForeignKey(nomina, on_delete=models.CASCADE)
    cedula = models.ForeignKey(empleado, on_delete=models.PROTECT)
    codigo = models.ForeignKey(concepto_pago, on_delete=models.PROTECT)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        verbose_name = "Detalle de Nomina"
        verbose_name_plural = "Detalles de Nomina"
        db_table = "detalle_nomina"

class recibo_pago(models.Model):
    nomina = models.ForeignKey(nomina, on_delete=models.CASCADE)
    cedula = models.ForeignKey(empleado, on_delete=models.PROTECT)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'recibo_pago'
        verbose_name = 'Recibo de Pago'
        verbose_name_plural = 'Recibos de Pago'
    
    def __str__(self):
        return f"Recibo {self.id} - {self.cedula.get_nombre_completo()} ({self.fecha_generacion.date()})"
    
    @property
    def detalles(self):
        """Propiedad que devuelve los detalles del recibo"""
        return self.detalle_recibo_set.all()
    
    @property
    def total_asignaciones(self):
        """Calcula el total de asignaciones del recibo"""
        return self.detalles.filter(
            detalle_nomina__codigo__tipo_concepto='ASIGNACION'
        ).aggregate(total=Sum('detalle_nomina__monto'))['total'] or 0
    
    @property
    def total_deducciones(self):
        """Calcula el total de deducciones del recibo"""
        return self.detalles.filter(
            detalle_nomina__codigo__tipo_concepto='DEDUCCION'
        ).aggregate(total=Sum('detalle_nomina__monto'))['total'] or 0
    
    @property
    def total_neto(self):
        """Calcula el neto a pagar"""
        return self.total_asignaciones - self.total_deducciones

class detalle_recibo(models.Model):
    recibo = models.ForeignKey(recibo_pago, on_delete=models.CASCADE, related_name='detalles')
    detalle_nomina = models.ForeignKey(detalle_nomina, on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'detalle_recibo'
        unique_together = ('recibo', 'detalle_nomina')  # Evita duplicados
    
    def __str__(self):
        return f"Detalle {self.detalle_nomina.id} en recibo {self.recibo.id}"
    

class prenomina(models.Model):
    id_prenomina = models.AutoField(primary_key=True, unique=True)
    nomina = models.OneToOneField(nomina, on_delete=models.CASCADE)  # Cada prenómina se asocia a una sola nómina
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prenomina'
        verbose_name = 'Pre-Nómina'
        verbose_name_plural = 'Pre-Nóminas'

    def __str__(self):
        return f"Prenómina de {self.nomina}"
    
class detalle_prenomina(models.Model):
    prenomina = models.ForeignKey(prenomina, on_delete=models.CASCADE, related_name='detalles')
    codigo = models.ForeignKey(concepto_pago, on_delete=models.PROTECT)
    total_monto = models.DecimalField(max_digits=14, decimal_places=2)

    class Meta:
        db_table = 'detalle_prenomina'
        verbose_name = 'Detalle de Pre-Nómina'
        verbose_name_plural = 'Detalles de Pre-Nómina'
        unique_together = ('prenomina', 'codigo')  # Evita duplicados por concepto

    def __str__(self):
        return f"{self.codigo.nombre} - Total: {self.total_monto} (Prenómina {self.prenomina.id_prenomina})"


"""class LineaRecibo(models.Model):
    recibo = models.ForeignKey(ReciboPago, on_delete=models.CASCADE, related_name='lineas')
    concepto = models.ForeignKey(ConceptoNomina, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=1, choices=[('I', 'Ingreso'), ('D', 'Deducción')])"""