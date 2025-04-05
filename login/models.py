from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class rol(models.Model):

    codigo_rol = models.CharField(max_length=5, unique=True, primary_key=True,)
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
        """Hashea la contraseña"""
        self.contraseña_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Verifica la contraseña"""
        return check_password(raw_password, self.contraseña_hash)
    
    def __str__(self):
        return f"{self.email} ({self.empleado_cedula})"
    

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
        db_column='usuario_cedula',
        to_field='id'
    )
    pregunta = models.ForeignKey(
        pregunta_seguridad,
        on_delete=models.PROTECT,
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
