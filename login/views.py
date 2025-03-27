from django.shortcuts import render
import json

# Create your views here.
def login(request):
    enable_fields = {'campo1': True, 'campo2': False}
    enable_fields_json = json.dumps(enable_fields)
    return render(request, 'login.html', {'enable_fields_json': enable_fields_json})

def crear_cuenta(request):
    return render(request, 'crear_cuenta.html')

def recuperar_contraseña(request):
    return render(request, 'recuperar_contraseña.html')