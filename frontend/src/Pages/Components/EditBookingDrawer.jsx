import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { APIURL } from "@/url.config";

export const EditBookingDrawer = ({
  open,
  onClose,
  onUpdate,
  appointmentId,
}) => {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]); // State for packages
  const [staff, setStaff] = useState([]);
  const [clients, setClients] = useState([]);
  const businessId = localStorage.getItem("businessId");

  const [formData, setFormData] = useState({
    services: [],
    packages: [], // Initialize with empty packages array
    business_id: businessId,
    staff: "",
    client_appointments: "",
    appointment_date: "",
    appointment_time: "",
    status: "Scheduled", // Default status
    payment_status: "Pending", // Default payment_status
    pay_mode: "Offline", // Default value for pay_mode
    notes: "",
  });

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      // Fetch appointment details
      const response = await fetch(
        `${APIURL}/api/appointments/${appointmentId}/`
      );
      const data = await response.json();

      // Set formData with the fetched data and include the business_id
      setFormData((prev) => ({
        ...prev,
        ...data,
        business_id: businessId, // Ensure business_id is included
      }));

      // Fetch related data for dropdowns
      const businessResponse = await fetch(
        `${APIURL}/api/business/${businessId}/`
      );
      const businessData = await businessResponse.json();
      setServices(businessData.business_services || []);
      setPackages(businessData.business_packages || []); // Fetch packages
      setStaff(businessData.business_team_members || []);
      setClients(businessData.clients || []);
    } catch (err) {
      console.error("Failed to fetch appointment details:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.services.length === 0 && formData.packages.length === 0) {
      alert("Please select at least one service or package.");
      return;
    }

    try {
      const response = await fetch(
        `${APIURL}/api/appointments/${appointmentId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert("Appointment updated successfully!");
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        alert("Failed to update appointment: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert("An error occurred while updating the appointment.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] sm:max-w-[1000px] px-10 py-8 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Edit Appointment
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Grouped Services and Packages Dropdown */}
          <div className="grid grid-cols-2 gap-6">
            {/* Services Dropdown */}
            <div className="space-y-2">
              <label className="font-medium">Service</label>
              <Select
                value={formData.services[0] || ""}
                onValueChange={(value) =>
                  handleInputChange("services", value ? [value] : [])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>{" "}
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.service_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Packages Dropdown */}
            <div className="space-y-2">
              <label className="font-medium">Package</label>
              <Select
                value={formData.packages[0] || ""}
                onValueChange={(value) =>
                  handleInputChange("packages", value ? [value] : [])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>{" "}
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.package_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grouped fields */}
          <div className="grid grid-cols-2 gap-6">
            {/* Staff Dropdown */}
            <div className="space-y-2">
              <label className="font-medium">Assign Staff</label>
              <Select
                value={formData.staff || ""}
                onValueChange={(value) => handleInputChange("staff", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clients Dropdown */}
            <div className="space-y-2">
              <label className="font-medium">Client</label>
              <Select
                value={formData.client_appointments || ""}
                onValueChange={(value) =>
                  handleInputChange("client_appointments", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-medium">Date</label>
              <Input
                type="date"
                value={formData.appointment_date}
                onChange={(e) =>
                  handleInputChange("appointment_date", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">Time</label>
              <Input
                type="time"
                value={formData.appointment_time}
                onChange={(e) =>
                  handleInputChange("appointment_time", e.target.value)
                }
              />
            </div>
          </div>

          {/* Grouped fields for Pay Mode and Payment Status */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pay Mode */}
            <div className="space-y-2">
              <label className="font-medium">Pay Mode</label>
              <Select
                value={formData.pay_mode}
                onValueChange={(value) => handleInputChange("pay_mode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pay mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="font-medium">Payment Status</label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) =>
                  handleInputChange("payment_status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Status */}
          <div className="space-y-2">
            <label className="font-medium">Appointment Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="bg-purple-600" onClick={handleSubmit}>
            Update Appointment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDrawer;
