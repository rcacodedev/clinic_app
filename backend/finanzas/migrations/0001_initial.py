# Generated by Django 5.1.4 on 2025-01-25 09:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('citas', '0009_citas_precio'),
        ('userinfo', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaccion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('INGRESO', 'Ingreso'), ('GASTO', 'Gasto')], default='INGRESO', max_length=7)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=10)),
                ('descripcion', models.TextField()),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('cita', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='citas.citas')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='userinfo.userinfo')),
            ],
        ),
    ]
