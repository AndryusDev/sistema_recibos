from django.db import models

# Create your models here.

from django.db import models

class Rol(models.Model):

    
    codigo_rol = models.CharField(
        max_length=5,
        unique=True,
        primary_key=True,
    )
    
    nombre_rol = models.CharField(
        max_length=50,
        unique=True,
    )
    
    descripcion = models.TextField(
    )
    
