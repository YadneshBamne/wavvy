"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "../Components/Navbar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentCalendar } from "../Components/AppointmentCalendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APIURL } from "@/url.config";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date()); // Selected date
  const [appointments, setAppointments] = useState([]); // All appointments
  const [filteredAppointments, setFilteredAppointments] = useState([]); // Appointments for the selected date

  // Fetch appointments and related data
  useEffect(() => {
    const fetchAppointments = async () => {
      const businessId = localStorage.getItem("businessId"); // Get business ID from localStorage
      if (!businessId) return;

      try {
        const response = await fetch(`${APIURL}/api/business/${businessId}/`);
        if (response.ok) {
          const data = await response.json();

          // Map and format appointments
          const formattedAppointments = data.business_appointments.map(
            (appointment) => {
              const client = data.clients.find(
                (client) => client.id === appointment.client_appointments
              );
              const staff = data.business_team_members.find(
                (member) => member.id === appointment.staff
              );
              const services = appointment.services.map((serviceId) => {
                const service = data.business_services.find(
                  (s) => s.id === serviceId
                );
                return service?.service_name || "Unknown Service";
              });
              const packages = appointment.packages.map((packageId) => {
                const pkg = data.business_packages.find(
                  (p) => p.id === packageId
                );
                return pkg?.package_name || "Unknown Package";
              });

              return {
                id: appointment.id,
                clientName: client?.client_name || "Unknown Client",
                staffName: staff
                  ? `${staff.first_name} ${staff.last_name}`
                  : "Unknown Staff",
                services,
                packages,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time.slice(0, 5), // Extract HH:MM
                totalAmount: appointment.total_amount,
                paymentStatus: appointment.payment_status,
                payMode: appointment.pay_mode,
              };
            }
          );

          setAppointments(formattedAppointments);
        } else {
          console.error("Failed to fetch appointments:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments for the selected date
  useEffect(() => {
    if (!date) return; // Ensure `date` is defined
    const selectedDateString = date.toISOString().split("T")[0]; // Convert selected date to YYYY-MM-DD format
    const filtered = appointments.filter(
      (appointment) => appointment.appointmentDate === selectedDateString
    );
    setFilteredAppointments(filtered);
  }, [date, appointments]);

  return (
    <div>
      <Navbar />
      <div className="p-8 bg-white">
        {/* Header Section */}
        <div className="flex items-center mb-4 justify-between py-8">
          <div className="flex flex-col mb-7">
            <span className="text-black font-bold text-3xl">Calendar</span>
            <span className="text-gray-500 font-thin text-xl">
              View all the activity
            </span>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-row space-x-4 outline outline-1 outline-gray-200 rounded-md px-2 py-4 bg-white">
          <div className="w-full flex items-center space-x-4 p-2">
            <Input
              type="text"
              placeholder="Search"
              className="flex-grow p-1 rounded-md"
            />
            <Input
              type="date"
              value={date.toISOString().split("T")[0]} // Sync input with selected date
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  setDate(newDate); // Update selected date
                }
              }}
              className="flex-grow p-1 rounded-md"
            />
            <Input
              type="text"
              placeholder="Filters"
              className="flex-grow p-1 rounded-md"
            />
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 px-10 rounded-lg"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 flex space-x-4">
          {/* Calendar Section */}
          <div className="w-3/4">
            <ScrollArea>
              <AppointmentCalendar
                selectedDate={date}
                appointments={appointments}
                onDateChange={setDate} // Allow calendar to update selected date
              />
            </ScrollArea>
          </div>

          {/* Side Panel */}
          <div className="w-1/4 space-y-4">
            {/* Mini Calendar */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate); // Update selected date when a new date is selected
                }
              }}
              className="rounded-md border bg-white outline outline-1 outline-gray-200"
            />

            {/* Upcoming Appointments */}
            <Card className="outline outline-1 outline-gray-200">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {appointment.clientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {appointment.clientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Staff: {appointment.staffName}
                            </p>
                            {appointment.services.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Services: {appointment.services.join(", ")}
                              </p>
                            )}
                            {appointment.packages.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Packages: {appointment.packages.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {appointment.appointmentTime}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No appointments for today.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
