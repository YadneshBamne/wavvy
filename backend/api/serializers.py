# serializers.py
from rest_framework import serializers
from .models import Business, OTP, ServiceCategory, Services, Client, TeamMember, Appointment, Packages
from phonenumber_field.serializerfields import PhoneNumberField

class ClientSerializer(serializers.ModelSerializer):
    business_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['business']
        
    def create(self, validated_data):
        business_id = validated_data.pop('business_id')
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business with the given ID does not exist.")
        
        client = Client.objects.create(business=business, **validated_data)
        return client


class OTPSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField
    
    class Meta:
        model = OTP
        fields = ['phone_number', 'otp']
    
    
class ServicesSerializer(serializers.ModelSerializer):
    business_id = serializers.IntegerField(write_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Services
        fields = '__all__'
        read_only_fields = ['business']
        
    def create(self, validated_data):
        business_id = validated_data.pop('business_id')
        category_id = validated_data.pop('category_id', None)
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business with the given ID does not exist.")
        
        if category_id:
            try:
                category = ServiceCategory.objects.get(id=category_id, business=business)
                validated_data['category'] = category
            except:
                raise serializers.ValidationError("Category Does Not Exists.")
        
        service = Services.objects.create(business=business, **validated_data)
        return service
    
class ServiceCategorySerializer(serializers.ModelSerializer):
    business_id = serializers.IntegerField(write_only=True)
    subcategories = serializers.SerializerMethodField()
    services = ServicesSerializer(many=True, read_only=True)
    
    class Meta:
        model = ServiceCategory
        fields = '__all__'
        read_only_fields = ['business']
        
    def get_subcategories(self, obj):
        # Fetch subcategories for the current category
        subcategories = obj.subcategories.all()
        # Serialize the subcategories using the same serializer
        return ServiceCategorySerializer(subcategories, many=True).data

    def create(self, validated_data):
        business_id = validated_data.pop('business_id')
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business with the given ID does not exist.")
        
        category = ServiceCategory.objects.create(business=business, **validated_data)
        return category
    
class PackagesSerializer(serializers.ModelSerializer):
    business_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Packages
        fields = '__all__'
        read_only_fields = ['business']
        
    def create(self, validated_data):
        business_id = validated_data.pop('business_id')
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business with the given ID does not exist.")
        
        package = Packages.objects.create(business=business, **validated_data)
        return package


class TeamMemberSerializer(serializers.ModelSerializer):
    business_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TeamMember
        fields = '__all__'
        read_only_fields = ['business']
        
    def create(self, validated_data):
        business_id = validated_data.pop('business_id')
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business with the given ID does not exist.")
        
        team_member = TeamMember.objects.create(business=business, **validated_data)
        return team_member
    
class AppointmentSerializer(serializers.ModelSerializer):
    services = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Services.objects.all()
    )
    packages = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Packages.objects.all(), required=False
    )
    business_id = serializers.IntegerField(write_only=True)
    client_appointments = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all()
    )
    staff = serializers.PrimaryKeyRelatedField(
        queryset=TeamMember.objects.all()
    )
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['business', 'client_appointments', 'staff', 'services']
        
    def get_total_amount(self, obj):
        """
        Calculate and return the total amount for the appointment.
        """
        return obj.total_amount()

    def create(self, validated_data):
        business_id = validated_data.pop('business_id')
        services = validated_data.pop('services', [])
        packages = validated_data.pop('packages', [])

        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business with the given ID does not exist.")

        # Save the appointment instance first
        appointment = Appointment.objects.create(business=business, **validated_data)

        # Set many-to-many relationships
        appointment.services.set(services)
        if packages:
            appointment.packages.set(packages)

        # Calculate the duration (if needed)
        service_duration = sum(service.duration_in_mins for service in services)
        package_duration = sum(package.package_duration_in_mins for package in packages)
        appointment.duration = service_duration + package_duration
        appointment.save()

        return appointment

        
class BusinessSerializer(serializers.ModelSerializer):
    clients = ClientSerializer(many=True, read_only=True)
    business_team_members = TeamMemberSerializer(many=True, read_only=True)
    business_services = ServicesSerializer(many=True, read_only=True)
    business_packages = PackagesSerializer(many=True, read_only=True)
    business_categories = ServiceCategorySerializer(many=True, read_only=True)
    business_appointments = AppointmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Business
        fields = '__all__'

    def create(self, validated_data):
        business = Business.objects.create(**validated_data)
        return business

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance