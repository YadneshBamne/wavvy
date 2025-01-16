import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "../Components/Navbar";
import AddServiceDrawer from "../Components/AddServices";
import { Link } from "react-router-dom";
import AddCategoryDrawer from "../Components/AddCategory";
import AddPackageDrawer from "../Components/AddPackages";
import { APIURL } from "@/url.config";

export default function Services() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPackageDrawerOpen, setIsPackageDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const businessId = localStorage.getItem("businessId");

  const handleServiceAdded = (newService) => {
    setServices((prevServices) => [...prevServices, newService]);
  };

  const handleCategoryAdded = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  const handlePackageAdded = (newPackage) => {
    setPackages((prevPackages) => [...prevPackages, newPackage]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${APIURL}/api/business/${businessId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data.business_services || []);
        setPackages(data.business_packages || []);
        setCategories([
          { id: 0, name: "All Services" },
          ...data.business_categories,
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 0) {
      // Show all services
      const response = await fetch(
        `${APIURL}/api/business/${businessId}`
      );
      const data = await response.json();
      setServices(data.business_services || []);
    } else {
      // Fetch services for a specific category
      try {
        const response = await fetch(
          `${APIURL}/api/service-categories/${categoryId}/`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Error fetching services by category:", error);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-8 bg-white">
        <div className="flex items-center mb-4 justify-between py-8">
          <div className="flex flex-col mb-7">
            <span className="text-black font-bold text-3xl">Service Menu</span>
            <span className="text-gray-500 font-thin text-xl">
              View and manage the services offered by your business
            </span>
          </div>
          <div className="space-x-4">
            <Button
              variant="secondary"
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 px-10 rounded-lg"
              onClick={() => setIsDrawerOpen(true)}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="flex flex-row space-x-4 outline outline-1 outline-gray-200 rounded-md px-2">
          <div className="bg-white rounded-md w-full flex items-center space-x-4 p-2">
            <Input
              type="text"
              placeholder="Search"
              className="flex-grow p-1 rounded-md"
            />
            <Input
              type="date"
              placeholder="Month to date"
              className="flex-grow p-1 rounded-md"
            />
            <Input
              type="text"
              placeholder="Filters"
              className="flex-grow p-1 rounded-md"
            />
          </div>
        </div>

        <div className="flex mt-10">
          {/* Sidebar */}
          <div className="w-1/4 p-4 bg-gray-100">
            {/* Categories Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Categories</h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Button
                      variant={
                        selectedCategory === category.id ? "solid" : "ghost"
                      }
                      className="w-full justify-between"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.name}
                    </Button>
                  </li>
                ))}
                <li>
                  <Link
                    className="pl-4 underline bg-white text-black pt-auto"
                    onClick={() => setIsCategoryDrawerOpen(true)}
                  >
                    Add Catgories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Packages Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Packages</h2>
              <ul className="space-y-2">
                {packages.map((pkg) => (
                  <li key={pkg.id}>
                    <Button variant="ghost" className="w-full justify-between">
                      {pkg.package_name}
                      <span className="bg-gray-300 px-2 py-1 rounded-full">
                        ₹{pkg.package_price}
                      </span>
                    </Button>
                  </li>
                ))}
                <li>
                  <Link
                    className="pt-auto pl-4 underline text-black"
                    onClick={() => setIsPackageDrawerOpen(true)}
                  >
                    Add Packages
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-3/4 p-4">
            <h1 className="text-xl font-bold mb-4">
              {selectedCategory === 0
                ? "All Services"
                : categories.find((c) => c.id === selectedCategory)?.name}
            </h1>
            <div className="space-y-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="flex justify-between items-center p-4"
                >
                  <div>
                    <h3 className="font-medium">{service.service_name}</h3>
                    <p className="text-sm text-gray-500">
                      {service.duration_in_mins} mins
                    </p>
                  </div>
                  <p className="text-lg font-semibold">₹{service.price}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer for Adding Items */}
        <AddServiceDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onServiceAdded={handleServiceAdded}
        />
        <AddCategoryDrawer
          open={isCategoryDrawerOpen}
          onOpenChange={setIsCategoryDrawerOpen}
          onCategoryAdded={handleCategoryAdded}
        />
        <AddPackageDrawer
          open={isPackageDrawerOpen}
          onOpenChange={setIsPackageDrawerOpen}
          onPackageAdded={handlePackageAdded}
        />
      </div>
    </div>
  );
}
