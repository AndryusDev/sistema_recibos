from django.core.management.base import BaseCommand
from login.models import empleado
from datetime import date

class Command(BaseCommand):
    help = 'Genera registros históricos de vacaciones para todos los empleados'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\nIniciando actualización de registros de vacaciones...'))
        self.stdout.write(f'Fecha de ejecución: {date.today()}\n')
        
        total_procesados = 0
        total_registros_creados = 0
        
        for emp in empleado.objects.all().order_by('primer_apellido', 'primer_nombre'):
            # Obtener cantidad de registros antes de la actualización
            registros_antes = emp.vacaciones_control.count()
            
            # Ejecutar la actualización
            emp.generar_registros_vacaciones()
            
            # Obtener cantidad después
            registros_despues = emp.vacaciones_control.count()
            nuevos_registros = registros_despues - registros_antes
            
            # Mostrar progreso
            if nuevos_registros > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✔ {emp.get_nombre_completo()} (Cédula: {emp.cedula}) - '
                        f'Registros creados: {nuevos_registros}'
                    )
                )
                total_registros_creados += nuevos_registros
            else:
                self.stdout.write(
                    f'▸ {emp.get_nombre_completo()} (Cédula: {emp.cedula}) - '
                    'Sin registros nuevos (ya estaban completos)'
                )
            
            total_procesados += 1
        
        # Resumen final
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(
            f'Proceso completado!\n'
            f'• Empleados procesados: {total_procesados}\n'
            f'• Registros de vacaciones creados: {total_registros_creados}'
        ))