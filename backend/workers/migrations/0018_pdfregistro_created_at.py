# Generated by Django 5.1.4 on 2025-06-12 15:03

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workers', '0017_alter_pdfregistro_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfregistro',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
