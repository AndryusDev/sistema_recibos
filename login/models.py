from datetime import date, timedelta
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.forms import ValidationError
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
        
# /////////////////// proceso nomina automatico   ///////////////
class nivel_salarial(models.Model):
    GRADO_CHOICES = [
        ('BI', 'BI - Bachiller I'),
        ('BII', 'BII - Bachiller II'),
        ('BIII', 'BIII - Bachiller III'),
        ('TI', 'TI - Técnico I'),
        ('TII', 'TII - Técnico II'),
        ('PI', 'PI - Profesional I'),
        ('PII', 'PII - Profesional II'),
        ('PIII', 'PIII - Profesional III'),
    ]
    
    NIVEL_CHOICES = [
        ('I', 'I'),
        ('II', 'II'),
        ('III', 'III'),
        ('IV', 'IV'),
        ('V', 'V'),
        ('VI', 'VI'),
        ('VII', 'VII'),
    ]
    
    grado = models.CharField(max_length=4, choices=GRADO_CHOICES)
    nivel = models.CharField(max_length=3, choices=NIVEL_CHOICES)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_trabajador = models.ForeignKey(tipo_trabajador, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'niveles_salariales'
        unique_together = ('grado', 'nivel', 'tipo_trabajador')
    
    def __str__(self):
        return f"{self.grado}-{self.nivel} (${self.monto})"
    
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

from dateutil.relativedelta import relativedelta
    
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
    
    nivel_salarial = models.ForeignKey(nivel_salarial, on_delete=models.PROTECT, null=True)
    
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
    
    def calcular_antiguedad(self, fecha_referencia=None):
        """Calcula años completos desde el ingreso hasta la fecha de referencia"""
        fecha_referencia = fecha_referencia or date.today()
        return relativedelta(fecha_referencia, self.fecha_ingreso).years

    def calcular_dias_vacaciones_por_año(self, año):
        """
        Calcula días según normativa venezolana:
        - 15 días al 1er año
        - +1 día por cada año adicional (máx 30)
        """
        if año < self.fecha_ingreso.year:
            return 0
            
        try:
            aniversario = date(año, self.fecha_ingreso.month, self.fecha_ingreso.day)
        except ValueError:  # Para 29/feb en años no bisiestos
            aniversario = date(año, 3, 1)

        antiguedad = self.calcular_antiguedad(aniversario)
        
        if antiguedad < 1:
            return 0
        return min(15 + max(antiguedad - 1, 0), 30)

    def generar_registros_vacaciones(self):
        """Crea registros solo para años faltantes sin modificar existentes"""
        año_actual = date.today().year
        
        for año in range(self.fecha_ingreso.year, año_actual + 1):
            if not control_vacaciones.objects.filter(empleado=self, año=año).exists():
                dias = self.calcular_dias_vacaciones_por_año(año)
                if dias > 0:
                    control_vacaciones.objects.create(
                        empleado=self,
                        año=año,
                        dias_acumulados=dias,
                        dias_pendientes=dias
                    )

    def save(self, *args, **kwargs):
        es_nuevo = not self.pk
        super().save(*args, **kwargs)
        if es_nuevo:
            self.generar_registros_vacaciones()

    def __str__(self):
        return self.get_nombre_completo()
    
    @property
    def nombre_completo(self):
        return self.get_nombre_completo()
    

class asistencias(models.Model):
    ESTADOS_ASISTENCIA = [
        ('A', 'Asistió'),
        ('F', 'Falta'),
        ('J', 'Falta Justificada'),
        ('V', 'Vacaciones'),
        ('P', 'Permiso'),
        ('L', 'Licencia'),
    ]
    
    empleado = models.ForeignKey(empleado, on_delete=models.CASCADE, related_name='asistencias')
    fecha = models.DateField()
    hora_entrada = models.TimeField(null=True, blank=True)
    hora_salida = models.TimeField(null=True, blank=True)
    estado = models.CharField(max_length=1, choices=ESTADOS_ASISTENCIA, default='A')
    observaciones = models.TextField(blank=True, null=True)
    registrado_por = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'asistencias'
        verbose_name = 'Asistencia del personal'
        verbose_name_plural = 'Asistencias del personal'
    
    def __str__(self):
        return f"{self.empleado} - {self.fecha} ({self.get_estado_display()})"

class Justificacion(models.Model):
    TIPOS_JUSTIFICACION = [
        ('M', 'Enfermedad'),
        ('P', 'Permiso'),
        ('O', 'Otro'),
    ]
    
    asistencias = models.ForeignKey(asistencias, on_delete=models.CASCADE, related_name='justificaciones')
    tipo = models.CharField(max_length=1, choices=TIPOS_JUSTIFICACION)
    descripcion = models.TextField()
    documento = models.FileField(upload_to='justificaciones/', null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    #aprobado = models.BooleanField(default=False)
    aprobado_por = models.ForeignKey(empleado, on_delete=models.SET_NULL, null=True, blank=True, related_name='justificaciones_aprobadas')
    fecha_aprobacion = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'justificaciones'
        verbose_name = 'Justificación de Falta'
        verbose_name_plural = 'Justificaciones de Faltas'
    
    def __str__(self):
        return f"Justificación {self.id} - {self.asistencias.empleado}"

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
    activo = models.BooleanField(default=True)
    
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
    
class permiso_asistencias(models.Model):
    empleado = models.ForeignKey('empleado', on_delete=models.CASCADE)
    fecha_inicio = models.DateField(default=date.today)  # Corregido
    fecha_fin = models.DateField( default=date.today)
    descriptcion = models.CharField(
        max_length=100,
        default='Permiso de asistencia'  # Corregido (era timezone.now)
    )
    """hecho_por = models.ForeignKey(
        'usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,  # Añadido para formularios
        related_name="aprobador"
    )"""
    class Meta:
        db_table = 'permiso_asistencias'
        verbose_name_plural = "Permisos_asistencias"

    def __str__(self):
        return f"Permiso de {self.empleado} ({self.fecha_inicio} - {self.fecha_fin})"

class control_vacaciones(models.Model):
    """
    Control anual de días acumulados, pendientes y tomados
    """
    empleado = models.ForeignKey(
        'empleado',  # Ajusta según tu app
        on_delete=models.CASCADE,
        related_name='vacaciones_control',
    )
    año = models.PositiveIntegerField()
    dias_acumulados = models.PositiveIntegerField(default=0)
    dias_tomados = models.PositiveIntegerField(default=0, editable=False)
    dias_pendientes = models.PositiveIntegerField(default=0, editable=False)
    ultima_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'control_vacaciones'
        unique_together = ('empleado', 'año')
        verbose_name_plural = 'Controles de Vacaciones'

    def clean(self):
        if self.dias_pendientes < 0:
            raise ValidationError("Los días pendientes no pueden ser negativos")

    def save(self, *args, **kwargs):
        self.dias_pendientes = self.dias_acumulados - self.dias_tomados
        super().save(*args, **kwargs)

    def actualizar_contadores(self):
        # Calcular dias_tomados sumando dias_efectivos de registros aprobados o completados
        from django.db.models import Q, Sum
        total_dias_tomados = self.registros_vacaciones.filter(
            Q(estado='APRO') | Q(estado='EN_C') | Q(estado='PAUS') | Q(estado='COMP')
        ).aggregate(total=Sum('dias_efectivos'))['total'] or 0
        self.dias_tomados = total_dias_tomados
        # dias_pendientes = dias_acumulados - dias_tomados, pero no puede ser negativo
        self.dias_pendientes = max(self.dias_acumulados - self.dias_tomados, 0)
        self.save()

    def __str__(self):
        return f"Control {self.año} - {self.empleado}"

from django.db.models.signals import post_save
from django.dispatch import receiver

class registro_vacaciones(models.Model):
    """
    Registro completo del ciclo de vida de cada período vacacional
    con capacidad de inhabilitar y reanudar
    """
    ESTADOS = (
        ('PLAN', 'Planificado'),
        ('APRO', 'Aprobado'),
        ('EN_C', 'En Curso'),
        ('PAUS', 'Pausado'),
        ('COMP', 'Completado'),
        ('CANC', 'Cancelado'),
    )

    control = models.ForeignKey(
    'control_vacaciones',
    on_delete=models.CASCADE,
    related_name='registros_vacaciones',
    null=True,  # Permite nulos temporalmente
    blank=True  # Permite blanco en formularios
)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    dias_planificados = models.PositiveIntegerField(
        default=0,  # Valor por defecto para registros existentes
        verbose_name="Días planificados de vacaciones"
    )
    dias_efectivos = models.PositiveIntegerField(default=0, help_text="Días realmente disfrutados")
    dias_habilitados = models.PositiveIntegerField(default=0, help_text="Días disponibles para usar")
    estado = models.CharField(max_length=4, choices=ESTADOS, default='PLAN')
    
    # Para manejo de interrupciones
    fecha_inhabilitacion = models.DateField(null=True, blank=True)
    fecha_reanudacion = models.DateField(null=True, blank=True)
    motivo_inhabilitacion = models.TextField(null=True, blank=True)
    
    # Auditoría
    creado_en = models.DateTimeField(
    auto_now_add=True,
    null=True,  # Permite nulos temporalmente
    blank=True  # Permite blanco en formularios
)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'registros_vacaciones'
        ordering = ['-fecha_inicio']
        verbose_name_plural = 'Registros de Vacaciones'

    def __str__(self):
        return f"Vacaciones {self.id} - {self.empleado} ({self.get_estado_display()})"

    @property
    def empleado(self):
        return self.control.empleado

    def clean(self):
        if self.fecha_fin <= self.fecha_inicio:
            raise ValidationError("La fecha de fin debe ser posterior al inicio")

    def save(self, *args, **kwargs):
        # Cálculo automático al crear
        if not self.pk:
            self.dias_planificados = (self.fecha_fin - self.fecha_inicio).days + 1
            self.dias_habilitados = self.dias_planificados
        
        super().save(*args, **kwargs)
        self.control.actualizar_contadores()
    
    def descontar_dia_habil(self):
        """
        Descuenta un día hábil de dias_habilitados y aumenta dias_efectivos si está en curso.
        """
        if self.estado == 'EN_C' and self.dias_habilitados > 0:
            self.dias_habilitados -= 1
            self.dias_efectivos += 1
            self.save()
    
    def iniciar(self):
        """Comienza el período vacacional"""
        if self.estado != 'APRO':
            raise ValidationError("Solo vacaciones aprobadas pueden iniciarse")
        self.estado = 'EN_C'
        self.save()
    
    def inhabilitar(self, fecha_inhabilitacion, motivo):
        """Pausa las vacaciones por emergencia"""
        if self.estado != 'EN_C':
            raise ValidationError("Solo vacaciones en curso pueden inhabilitares")
        
        dias_usados = (fecha_inhabilitacion - self.fecha_inicio).days + 1
        if dias_usados <= 0:
            raise ValidationError("Fecha de inhabilitación inválida")
        
        self.estado = 'PAUS'
        self.fecha_inhabilitacion = fecha_inhabilitacion
        self.motivo_inhabilitacion = motivo
        self.dias_efectivos = dias_usados
        self.dias_habilitados = self.dias_planificados - dias_usados
        self.save()
    
    def reanudar(self, fecha_reanudacion):
        """Reanuda vacaciones previamente inhabilitadas"""
        if self.estado != 'PAUS':
            raise ValidationError("Solo vacaciones pausadas pueden reanudarse")
        
        if fecha_reanudacion <= self.fecha_inhabilitacion:
            raise ValidationError("La reanudación debe ser después de la inhabilitación")
        
        # Actualiza fechas y días
        dias_pausa = (fecha_reanudacion - self.fecha_inhabilitacion).days - 1
        self.fecha_fin = self.fecha_fin + timedelta(days=dias_pausa)
        self.fecha_reanudacion = fecha_reanudacion
        self.estado = 'EN_C'
        self.save()
    
    def completar(self):
        """Marca como completadas normalmente"""
        if self.estado not in ['EN_C', 'PAUS']:
            raise ValidationError("Solo vacaciones activas o pausadas pueden completarse")
        
        if self.estado == 'PAUS':
            self.dias_efectivos = (self.fecha_inhabilitacion - self.fecha_inicio).days + 1
        else:
            self.dias_efectivos = (date.today() - self.fecha_inicio).days + 1
        
        self.estado = 'COMP'
        self.save()
    def aprobar(self):
        """Transición a estado Aprobado"""
        if self.estado != 'PLAN':
            raise ValidationError("Solo vacaciones planificadas pueden aprobarse")
        self.estado = 'APRO'
        self.save()

    def iniciar(self):
        """Comienza el período vacacional"""
        if self.estado != 'APRO':
            raise ValidationError("Solo vacaciones aprobadas pueden iniciarse")
        self.estado = 'EN_C'
        self.save()

    def inhabilitar(self, fecha_inhabilitacion, motivo):
        """Pausa las vacaciones por emergencia"""
        if self.estado != 'EN_C':
            raise ValidationError("Solo vacaciones en curso pueden inhabilitares")
        
        dias_usados = (fecha_inhabilitacion - self.fecha_inicio).days + 1
        if dias_usados <= 0:
            raise ValidationError("Fecha de inhabilitación inválida")
        
        self.estado = 'PAUS'
        self.fecha_inhabilitacion = fecha_inhabilitacion
        self.motivo_inhabilitacion = motivo
        self.dias_efectivos = dias_usados
        self.dias_habilitados = self.dias_planificados - dias_usados
        self.save()

    def reanudar(self, fecha_reanudacion):
        """Reanuda vacaciones previamente inhabilitadas"""
        if self.estado != 'PAUS':
            raise ValidationError("Solo vacaciones pausadas pueden reanudarse")
        
        if fecha_reanudacion <= self.fecha_inhabilitacion:
            raise ValidationError("La reanudación debe ser después de la inhabilitación")
        
        # Actualiza fechas y días
        dias_pausa = (fecha_reanudacion - self.fecha_inhabilitacion).days - 1
        self.fecha_fin = self.fecha_fin + timedelta(days=dias_pausa)
        self.fecha_reanudacion = fecha_reanudacion
        self.estado = 'EN_C'
        self.save()

    def completar(self):
        """Marca como completadas normalmente"""
        if self.estado not in ['EN_C', 'PAUS']:
            raise ValidationError("Solo vacaciones activas o pausadas pueden completarse")
        
        if self.estado == 'PAUS':
            self.dias_efectivos = (self.fecha_inhabilitacion - self.fecha_inicio).days + 1
        else:
            self.dias_efectivos = (date.today() - self.fecha_inicio).days + 1
        
        self.estado = 'COMP'
        self.save()


@receiver(post_save, sender=registro_vacaciones)
def actualizar_control_vacaciones(sender, instance, created, **kwargs):
    """
    Señal para actualizar dias_pendientes en control_vacaciones cuando se crea o actualiza un registro_vacaciones
    """
    if instance.control:
        # Al crear un nuevo registro, poner dias_pendientes en control a 0
        if created:
            instance.control.dias_pendientes = 0
            instance.control.save()
        # Actualizar contadores siempre
        instance.control.actualizar_contadores()

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


