import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APIURL } from "@/url.config";

export function ProfileView() {
  const [profile, setProfile] = useState(null);
  const businessId = localStorage.getItem("businessId");
  const url = `${APIURL}/api/business/${businessId}/`;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data); // Update the profile state with API response
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [url]);

  // Show a loading state while data is being fetched
  if (!profile) {
    return <div>Profile Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={profile.profile_img || undefined}
            alt={profile.owner_name}
          />
          <AvatarFallback>{profile.owner_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile.salon_name}</h2>
          <p className="text-muted-foreground">{profile.owner_name}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Phone Number</h3>
          <p>{profile.phone_number}</p>
        </div>
        <div>
          <h3 className="font-semibold">Email</h3>
          <p>{profile.owner_email}</p>
        </div>
        <div>
          <h3 className="font-semibold">GST</h3>
          <p>{profile.gst || "N/A"}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold">Salon Description</h3>
        <p>{profile.salon_description || "No description available"}</p>
      </div>
    </div>
  );
}
