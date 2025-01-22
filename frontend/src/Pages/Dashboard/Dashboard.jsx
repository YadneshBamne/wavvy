import React, { useState, useEffect } from "react";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import avatar1 from "../../assets/Avatar-1.png";
import avatar2 from "../../assets/Avatar-2.png";
import avatar3 from "../../assets/Avatar.png";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Navbar } from "../Components/Navbar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { APIURL } from "@/url.config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(4);
  const navigate = useNavigate();

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const businessId = localStorage.getItem("businessId");
        if (!businessId) {
          navigate("/login");
        }

        const response = await fetch(
          `${APIURL}/api/business/${businessId}/?format=json`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch business data");
        }

        const data = await response.json();
        setBusinessData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Early return for loading or error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Chart data and options
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Net Sales",
        data: [10000, 20000, 15000, 25000, 30000, 40000],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Gross Sales",
        data: [20000, 30000, 25000, 35000, 45000, 60000],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `$${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return `$${value / 1000}k`;
          },
        },
      },
    },
  };

  const teamMembers = [
    { name: "John Doe", image: avatar1 },
    { name: "Hourglass", image: avatar2 },
    { name: "Layers", image: avatar3 },
  ];

  const days = [
    { day: "SUN", date: 1 },
    { day: "MON", date: 2 },
    { day: "TUE", date: 3 },
    { day: "THU", date: 4 },
    { day: "WED", date: 5 },
    { day: "FRI", date: 6 },
    { day: "SAT", date: 7 },
  ];
  return (
    <>
      <Navbar />
      <div className="p-9 space-y-6 ">
        {/* Statistics Section */}
        <span className="text-4xl font-semibold">
          Hello,
          <br /> {businessData?.salon_name}
        </span>
        <div className="grid grid-cols-4 gap-5">
          {/* Active Appointments */}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Active Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                {businessData?.business_appointments?.length || 0}
              </p>
            </CardContent>
          </Card>

          {/* Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                {businessData?.business_team_members?.length || 0}
              </p>
            </CardContent>
          </Card>

          {/* Total Customers Served */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Total Customers Served
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                {businessData?.clients?.length || 0}
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="p-8 max-w-md mx-auto">
            <h2 className="text-md font-semibold text-gray-900 mb-4">
              Upcoming Appointments
            </h2>
            <div className="grid grid-cols-7 gap-4 text-center">
              {days.map(({ day, date }) => (
                <Button
                  key={date}
                  variant={selectedDay === date ? "default" : "ghost"}
                  className={`flex flex-col items-center justify-center rounded-md py-9 space-y-3 ${
                    selectedDay === date
                      ? "bg-purple-500 text-white"
                      : "text-gray-500 hover:text-black"
                  }`}
                  onClick={() => setSelectedDay(date)}
                >
                  <span className="text-xs font-normal">{day}</span>
                  <span className="text-2xl font-bold">{date}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Gross & Net Sales Chart */}
          {/* <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Gross & Net Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card> */}

          {/* Business Services */}
          {businessData?.business_services?.map((service) => (
            <Card key={service.id}>
              <CardHeader></CardHeader>
              <CardContent>
                <img
                  src={service.service_image || image1} // Replace with dynamic image if available
                  alt={service.service_name}
                  className="rounded-md h-40 w-120"
                />
                <p className="mt-3 text-lg font-semibold">
                  {service.service_name}
                </p>
                <p className="text-lg font-semibold">
                  Price:{" "}
                  <span className="text-purple-600">${service.price}</span>
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Top Team Members */}
          <div className="">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Team Members
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {businessData?.business_team_members?.map((member) => (
                <Card
                  key={member.id}
                  className="flex flex-col items-center text-center shadow-md"
                >
                  <Avatar className="w-10 h-10 mb-6 mt-4">
                    <AvatarImage
                      src={member.profile_img} // Fallback to a default avatar if no image is available
                      alt={`${member.first_name} ${member.last_name}`}
                    />
                    <AvatarFallback>
                      {member.first_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm p-2 font-medium text-gray-800">
                    {`${member.first_name} ${member.last_name}`}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="items-end justify-end">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessData?.business_appointments
                  ?.sort((a, b) => {
                    // Sort by date and time (latest first)
                    const dateA = new Date(
                      `${a.appointment_date}T${a.appointment_time}`
                    );
                    const dateB = new Date(
                      `${b.appointment_date}T${b.appointment_time}`
                    );
                    return dateB - dateA; // Descending order
                  })
                  .slice(0, 20) // Limit to last 20 appointments
                  .map((appointment, index) => {
                    // Find the team member's name using the staff ID
                    const teamMember = businessData.business_team_members?.find(
                      (member) => member.id === appointment.staff
                    );
                    const teamMemberName = teamMember
                      ? `${teamMember.first_name} ${teamMember.last_name}`
                      : "Unknown Team Member";

                    // Find the service name
                    const service = businessData.business_services?.find(
                      (service) => service.id === appointment.services[0]
                    );
                    const serviceName = service
                      ? service.service_name
                      : "Unknown Service";

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={teamMember.profile_img}
                              alt={teamMemberName}
                            />
                            <AvatarFallback>
                              {teamMemberName
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{teamMemberName}</p>
                            <p className="text-sm text-gray-500">
                              {serviceName}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            `${appointment.appointment_date}T${appointment.appointment_time}`
                          ).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
