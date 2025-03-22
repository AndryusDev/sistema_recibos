from django.shortcuts import render
import json

# Create your views here.
def login(request):
    enable_fields = {'campo1': True, 'campo2': False}
    enable_fields_json = json.dumps(enable_fields)
    return render(request, 'login.html', {'enable_fields_json': enable_fields_json})