import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "../Components/Navbar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { PenIcon, TrashIcon } from "lucide-react";
import CreateAppointment from "../Components/AddBookingDrawer";
import { EditBookingDrawer } from "../Components/EditBookingDrawer";
import { Link, useNavigate } from "react-router-dom";
import { APIURL } from "@/url.config";

export function Bookings() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const navigate = useNavigate();

  // Fetch package details
  const fetchPackageDetails = async (packageIds) => {
    const packageDetails = await Promise.all(
      packageIds.map(async (packageId) => {
        const response = await fetch(`${APIURL}/api/packages/${packageId}/`);
        if (!response.ok)
          throw new Error(`Failed to fetch package ${packageId}`);
        return response.json();
      })
    );
    return packageDetails;
  };

  // Fetch detailed appointment data
  const fetchDetailedAppointmentData = async (appointments) => {
    const detailedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const [
            clientResponse,
            staffResponse,
            servicesResponses,
            packageResponses,
          ] = await Promise.all([
            fetch(
              `${APIURL}/api/clients/${appointment.client_appointments}/`
            ).then((res) =>
              res.ok
                ? res.json()
                : Promise.reject("Failed to fetch client data")
            ),
            fetch(`${APIURL}/api/team-members/${appointment.staff}/`).then(
              (res) =>
                res.ok
                  ? res.json()
                  : Promise.reject("Failed to fetch staff data")
            ),
            Promise.all(
              appointment.services.map((serviceId) =>
                fetch(`${APIURL}/api/services/${serviceId}/`).then((res) =>
                  res.ok
                    ? res.json()
                    : Promise.reject(`Failed to fetch service ${serviceId}`)
                )
              )
            ),
            fetchPackageDetails(appointment.packages || []),
          ]);

          return {
            ...appointment,
            client: clientResponse,
            staff: staffResponse,
            services: servicesResponses,
            packages: packageResponses,
          };
        } catch (err) {
          console.error("Error fetching detailed data for appointment:", err);
          return appointment; // Return without extra data on failure
        }
      })
    );

    return detailedAppointments;
  };

  // Fetch business data
  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      if (!businessId) {
        throw new Error("Business ID is missing");
      }
      const response = await fetch(`${APIURL}/api/business/${businessId}/`);
      if (!response.ok) throw new Error("Failed to fetch business data");
      const data = await response.json();
      const detailedAppointments = await fetchDetailedAppointmentData(
        data.business_appointments || []
      );

      setAppointments(detailedAppointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const theMainThing = localStorage.getItem("businessId");
    if (!theMainThing) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const storedBusinessId = localStorage.getItem("businessId");
    if (storedBusinessId) {
      setBusinessId(storedBusinessId);
    }
  }, []);

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;

    try {
      const response = await fetch(`${APIURL}/api/appointments/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete appointment");
      fetchBusinessData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <div className="flex items-center mb-4 justify-between p-8">
          <div className="flex flex-col mb-7">
            <span className="text-black font-bold text-3xl">Appointments</span>
            <span className="text-gray-500 font-thin text-xl">
              View, create, and manage client appointments
            </span>
          </div>
          <div className="space-x-4">
            <Button
              onClick={() => setIsAddModalOpen((prev) => !prev)}
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Create Appointment
            </Button>
            <Link to="/clients">
              <Button className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg">
                Manage Clients
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <Table className="w-full bg-white shadow-xl rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Pay Mode</TableHead>
                  <TableHead>Services/Packages</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Status</TableHead> {/* New column */}
                  <TableHead>Appointment Status</TableHead> {/* New column */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {appointment.client?.client_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {appointment.client?.client_phone || "N/A"}
                    </TableCell>
                    <TableCell>{appointment.pay_mode}</TableCell>
                    <TableCell>
                      {[
                        ...(appointment.services || []).map(
                          (service) => service.service_name
                        ),
                        ...(appointment.packages || []).map(
                          (pkg) => pkg.package_name
                        ),
                      ].join(", ") || "No Services or Packages"}
                    </TableCell>
                    <TableCell>
                      {appointment.staff
                        ? `${appointment.staff.first_name} ${appointment.staff.last_name}`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell>{appointment.appointment_date}</TableCell>
                    <TableCell>{appointment.appointment_time}</TableCell>
                    <TableCell>₹{appointment.total_amount}</TableCell>
                    <TableCell>{appointment.payment_status}</TableCell>{" "}
                    {/* Payment Status */}
                    <TableCell>{appointment.status}</TableCell>{" "}
                    {/* Appointment Status */}
                    <TableCell className="flex space-x-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => {
                          setSelectedAppointmentId(appointment.id);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <PenIcon size={20} />
                      </button>

                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <TrashIcon size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add Booking Modal */}
      <CreateAppointment
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={fetchBusinessData}
        businessId={businessId}
      />

      <EditBookingDrawer
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={fetchBusinessData}
        appointmentId={selectedAppointmentId}
      />
    </div>
  );
}
