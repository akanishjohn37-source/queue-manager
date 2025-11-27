from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Queue Manager API</h1><p>Go to <a href='/api/'>/api/</a> or the <a href='http://localhost:5173'>Frontend</a></p>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', home),
]
