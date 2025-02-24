# Generated by Django 5.1.4 on 2025-01-08 14:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citas', '0007_alter_citas_worker'),
        ('workers', '0003_alter_worker_address_alter_worker_first_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='citas',
            name='worker',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='workers.worker'),
        ),
    ]
