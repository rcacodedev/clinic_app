# Generated by Django 5.1.4 on 2025-01-08 14:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citas', '0006_citas_worker'),
        ('workers', '0002_worker_address_worker_country_worker_dni_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='citas',
            name='worker',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='workers.worker'),
        ),
    ]
