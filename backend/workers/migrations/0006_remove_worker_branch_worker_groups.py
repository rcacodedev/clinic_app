# Generated by Django 5.1.4 on 2025-02-10 08:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('workers', '0005_worker_phone'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='worker',
            name='branch',
        ),
        migrations.AddField(
            model_name='worker',
            name='groups',
            field=models.ManyToManyField(blank=True, related_name='workers', to='auth.group'),
        ),
    ]
