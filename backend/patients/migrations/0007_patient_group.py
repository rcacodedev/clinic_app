# Generated by Django 5.1.4 on 2025-02-19 18:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('patients', '0006_rename_pdf_firmado_patient_pdf_firmado_general_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='group',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='patients', to='auth.group'),
        ),
    ]
