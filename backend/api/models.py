from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import random
from phonenumber_field.modelfields import PhoneNumberField
from datetime import timedelta
from django.utils.timezone import now

# Validation for image size
def validate_image_size(file):
    max_size = 2 * 1024 * 1024  # 2 MB
    if file.size > max_size:
        raise ValidationError("File size exceeds the 2 MB limit.")

class Business(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    owner_name = models.CharField(max_length=100)
    salon_name = models.CharField(max_length=100)
    owner_email = models.EmailField()
    gst = models.CharField(max_length=15, blank=True, null=True)
    salon_description = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    profile_img = models.ImageField(upload_to="profiles/", null=True, blank=True, validators=[validate_image_size])

    def __str__(self):
        return self.salon_name

class ServiceCategory(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_categories')
    name = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True, max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    def __str__(self):
        return self.name

class Services(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_services')
    service_name = models.CharField(max_length=50)
    service_type = models.CharField(
        max_length=50,
        choices=[("Basic", "Basic"), ("Premium", "Premium"), ("Add-on", "Add-on")]
    )
    duration_in_mins = models.PositiveIntegerField()
    price = models.PositiveIntegerField()
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, null=True, blank=True, related_name="services")
    service_image = models.ImageField(upload_to="services-images/", null=True, blank=True)

    def __str__(self):
        return self.service_name
    
class Packages(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_packages')
    package_name = models.CharField(max_length=50)
    package_duration_in_mins = models.PositiveIntegerField()
    package_price = models.PositiveIntegerField()

    def __str__(self):
        return self.package_name

class Client(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='clients')
    client_name = models.CharField(max_length=255)
    client_type = models.CharField(
        max_length=50,
        choices=[("Regular", "Regular"), ("Premium", "Premium"), ("Corporate", "Corporate"), ("Walk-in", "Walk-in")]
    )
    client_email = models.EmailField(max_length=40, unique=True)
    client_phone = models.CharField(max_length=15, unique=True)
    client_dob = models.DateField(null=True, blank=True)
    client_gender = models.CharField(
        max_length=20,
        choices=[("Male", "Male"), ("Female", "Female"), ("Rather Not to Say", "Rather Not to Say")]
    )

    def __str__(self):
        return self.client_name

class TeamMember(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_team_members')
    profile_img = models.ImageField(upload_to="team-profiles/", null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, unique=True)
    member_email = models.EmailField(unique=True)
    date_of_joining = models.DateField()
    access_type = models.CharField(
        max_length=50,
        choices=[("Super Admin", "Super Admin"), ("Admin", "Admin")]
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Appointment(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_appointments')
    services = models.ManyToManyField(Services, related_name="appointments")
    packages = models.ManyToManyField(Packages, related_name="appointments", blank=True)
    staff = models.ForeignKey(TeamMember, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointments")
    client_appointments = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="client_appointments")
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("Scheduled", "Scheduled"),
            ("Completed", "Completed"),
            ("Cancelled", "Cancelled")
        ],
        default="Scheduled"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("Pending", "Pending"),
            ("Completed", "Completed")
        ],
        default="Pending"
    )
    pay_mode = models.CharField(
        choices=[("Online", "Online"), ("Offline", "Offline")],
        default="Offline",
        max_length=10
    )
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Appointment for {self.client_appointments.client_name} on {self.appointment_date}"
    
    def total_amount(self):
        """
        Calculate the total amount for the appointment by summing up the prices of all services and packages.
        """
        # Sum of service prices
        service_total = sum(service.price for service in self.services.all())
        
        # Sum of package prices
        package_total = sum(package.package_price for package in self.packages.all())
        
        # Return the total amount
        return service_total + package_total


class OTP(models.Model):
    phone_number = PhoneNumberField(unique=False)
    otp = models.CharField(max_length=4)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.otp = str(random.randint(1000, 9999))
        self.save()
        
    def is_expired(self):
        """Check if OTP is expired."""
        return self.created_at < now() - timedelta(minutes=5)