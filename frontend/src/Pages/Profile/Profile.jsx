"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileView } from "./View/View";
import { ProfileEdit } from "./Edit/Edit";
import { Navbar } from "../Components/Navbar";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    phone_number: "+1 (555) 123-4567",
    owner_name: "Jane Doe",
    salon_name: "Glamour Cuts",
    owner_email: "jane.doe@glamourcuts.com",
    gst: "GST1234567",
    salon_description:
      "Glamour Cuts is a premium salon offering a wide range of hair and beauty services. Our experienced stylists are dedicated to making you look and feel your best.",
    profile_img: "https://example.com/jane-doe-profile.jpg",
  });

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  return (
    <>
    <Navbar /> 

    <Card className="w-full max-w-2xl mx-auto mt-20">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <ProfileEdit
            profile={profile}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <ProfileView profile={profile} />
            <Button className="bg-purple-600 hover:bg-purple-700 mt-4" onClick={handleEdit}>
              Edit Profile
            </Button>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
}
