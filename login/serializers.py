from rest_framework import serializers
from .models import ARC, DetalleARC, empleado, detalle_nomina, nomina, concepto_pago

class DetalleARCSerializer(serializers.ModelSerializer):
    nombre_mes = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleARC
        fields = ['mes', 'nombre_mes', 'monto_bruto', 'porcentaje_retencion', 
                'islr_retenido', 'monto_neto', 'monto_declarar', 'especificacion']
    
    def get_nombre_mes(self, obj):
        meses = [
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
        ]
        return meses[obj.mes - 1] if 1 <= obj.mes <= 12 else ""

class ARCSerializer(serializers.ModelSerializer):
    detalles = DetalleARCSerializer(many=True, read_only=True)
    nombre_completo = serializers.CharField(source='empleado.get_nombre_completo', read_only=True)
    cedula = serializers.CharField(source='empleado.cedula', read_only=True)
    
    class Meta:
        model = ARC
        fields = ['id_arc', 'empleado', 'nombre_completo', 'cedula', 'anio', 
                'total_monto_declarar', 'total_vacaciones', 'total_aguinaldos',
                'total_evaluacion', 'total_salarios', 'fecha_generacion', 'detalles']