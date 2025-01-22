import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { APIURL } from "@/url.config";
import { ScrollArea } from "@/components/ui/scroll-area"

// Generate 24-hour time slots (every 30 minutes)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Helper function to find the nearest time slot
const getNearestTimeSlot = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  const roundedMinute = minute < 30 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${roundedMinute}`;
};

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  // Fetch appointments from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      const businessId = localStorage.getItem("businessId");
      if (!businessId) return;

      try {
        const response = await fetch(`${APIURL}/api/business/${businessId}`);
        const data = await response.json();

        // Format appointments from the response
        const formattedAppointments = data.business_appointments.map(
          (appointment) => {
            const client = data.clients.find(
              (client) => client.id === appointment.client_appointments
            );

            const services = appointment.services.map((serviceId) => {
              const service = data.business_services.find(
                (service) => service.id === serviceId
              );
              return service?.service_name || "Unknown Service";
            });

            const packages = appointment.packages.map((packageId) => {
              const pkg = data.business_packages.find(
                (pkg) => pkg.id === packageId
              );
              return pkg?.package_name || "Unknown Package";
            });

            return {
              id: appointment.id,
              name: client?.client_name || "Unknown Client",
              services,
              packages,
              time: getNearestTimeSlot(
                appointment.appointment_time.slice(0, 5)
              ), // Map to nearest time slot
              date: appointment.appointment_date,
              duration:
                services.length > 0
                  ? data.business_services.find(
                      (s) => s.id === appointment.services[0]
                    )?.duration_in_mins || 0
                  : 0,
            };
          }
        );

        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Handle navigation to the next day
  const nextDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  };

  // Handle navigation to the previous day
  const prevDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  };

  // Filter appointments for the selected date
  const selectedDateString = currentDate.toISOString().split("T")[0];
  const filteredAppointments = appointments.filter(
    (apt) => apt.date === selectedDateString
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Date Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Time Slots Grid */}
        <ScrollArea className="h-96 w-full rounded-md border">
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="text-sm text-gray-500 pt-4 ml-4">{time}</div>
              <div className="border-t border-gray-200 pt-2 ml-4">
                {filteredAppointments
                  .filter((apt) => apt.time === time) // Match appointments for the nearest time slot
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-purple-100 text-purple-800 rounded mb-2"
                    >
                      <div className="font-semibold">{apt.name}</div>
                      {apt.services.length > 0 && (
                        <div className="text-sm">
                          Services: {apt.services.join(", ")}
                        </div>
                      )}
                      {apt.packages.length > 0 && (
                        <div className="text-sm">
                          Packages: {apt.packages.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </React.Fragment>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
