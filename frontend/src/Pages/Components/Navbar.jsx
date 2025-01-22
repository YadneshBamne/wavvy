import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom"; // Use NavLink instead of Link
import {
  House,
  CalendarClock,
  BookOpen,
  UsersRound,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import avatar1 from "../../assets/Avatar-1.png";
import { Button } from "@/components/ui/button";
import { APIURL } from "@/url.config";

export function Navbar() {
  const businessId = localStorage.getItem("businessId");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("businessId")
  );
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState({
    businessName: "",
    ownerName: "",
  });
  const url = `${APIURL}/api/business/${businessId}/`;

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBusinessData({
            businessName: data.salon_name, // Mapping salon_name to businessName
            ownerName: data.owner_name,
            profileImage: data.profile_img, // Mapping owner_name to ownerName
          });
        } else {
          console.error("Failed to fetch business info");
        }
      } catch (error) {
        console.error("Error fetching business info:", error);
      }
    };

    fetchBusinessInfo();
  }, [url]);

  // Monitor changes in login state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("businessId"));
    };

    // Listen for changes to localStorage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("businessId");
    setIsLoggedIn(false); // Update state
    navigate("/login"); // Redirect to login page
  };

  if (!isLoggedIn) {
    return null; // Do not render the Navbar if the user is logged out
  }

  return (
    <nav className="flex items-center justify-between bg-white shadow-md p-4">
      {/* Logo at the start */}
      <div className="flex-shrink-0">
        <span className="text-xl font-semibold">WAVVE</span>
      </div>

      {/* Nav links in the middle */}
      <div className="flex-grow">
        <div className="flex justify-center space-x-4">
          <NavLink
            to="/dashboard"
            className="button-nav"
            activeClassName="bg-indigo-600 text-white"
          >
            <Button variant="ghost">
              <House stroke="purple" size={30} /> Home
            </Button>
          </NavLink>
          <NavLink
            to="/calendar"
            className="button-nav"
            activeClassName="bg-indigo-600 text-white"
          >
            <Button variant="ghost">
              <CalendarClock stroke="purple" /> Calendar
            </Button>
          </NavLink>
          <NavLink
            to="/services"
            className="button-nav"
            activeClassName="bg-indigo-600 text-white"
          >
            <Button variant="ghost">
              <ShoppingBag stroke="purple" /> Services
            </Button>
          </NavLink>
          <NavLink
            to="/bookings"
            className="button-nav"
            activeClassName="bg-indigo-600 text-white"
          >
            <Button variant="ghost">
              <BookOpen stroke="purple" /> Bookings
            </Button>
          </NavLink>
          <NavLink
            to="/manage-team"
            className="button-nav"
            activeClassName="bg-indigo-600 text-white"
          >
            <Button variant="ghost">
              <UsersRound stroke="purple" /> My Team
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Avatar, name, and dropdown */}
      <div className="flex-shrink-0 flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer space-x-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={businessData.profileImage} alt={businessData.ownerName} />
              </Avatar>
              <span className="text-sm font-medium">{businessData.ownerName}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white shadow-md">
            <DropdownMenuItem>
              <NavLink to="/profile" className="w-full text-left">
                My Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button onClick={handleLogout} className="w-full text-left">
                Logout
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
