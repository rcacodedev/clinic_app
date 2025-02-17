# Generated by Django 5.1.4 on 2025-01-25 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfiguracionFinanzas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('precio_cita_base', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Precio base de la cita')),
                ('ultima_actualizacion', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='transaccion',
            name='url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='transaccion',
            name='tipo',
            field=models.CharField(choices=[('INGRESO', 'Ingreso'), ('GASTO', 'Gasto'), ('INGRESO_COTIZADO', 'Ingreso_Cotizado')], default='INGRESO', max_length=100),
        ),
    ]
