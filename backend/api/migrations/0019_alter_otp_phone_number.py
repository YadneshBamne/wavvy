# Generated by Django 5.1.4 on 2025-01-09 08:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0018_remove_client_appointment_history_business_password_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="otp",
            name="phone_number",
            field=models.CharField(max_length=15),
        ),
    ]
