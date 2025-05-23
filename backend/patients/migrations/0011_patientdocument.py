# Generated by Django 5.1.4 on 2025-03-20 07:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0010_alter_patient_pdf_firmado_general_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='PatientDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='media/patient_documents/')),
                ('upload_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='patients.patient')),
            ],
        ),
    ]
