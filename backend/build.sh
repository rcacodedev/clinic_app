# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Iniciar servidor con Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
