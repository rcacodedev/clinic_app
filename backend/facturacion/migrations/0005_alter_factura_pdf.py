# Generated by Django 5.1.4 on 2025-03-27 07:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('facturacion', '0004_alter_factura_usuario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='factura',
            name='pdf',
            field=models.FileField(blank=True, null=True, upload_to='media/facturas/'),
        ),
    ]
