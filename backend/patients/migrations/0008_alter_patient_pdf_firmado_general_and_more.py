# Generated by Django 5.1.4 on 2025-02-21 16:48

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0007_patient_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patient',
            name='pdf_firmado_general',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='pdf_firmado_general'),
        ),
        migrations.AlterField(
            model_name='patient',
            name='pdf_firmado_inyecciones',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='pdf_firmado_inyecciones'),
        ),
        migrations.AlterField(
            model_name='patient',
            name='pdf_firmado_menor',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='pdf_firmado_menor'),
        ),
        migrations.AlterField(
            model_name='patient',
            name='phone',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
