"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast"; // Import ShadCN toast hook
import { APIURL } from "@/url.config";

export function ProfileEdit({ onSave, onCancel }) {
  const { toast } = useToast(); // Initialize the ShadCN toast
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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
          setProfile(data);
          setEditedProfile(data);
          setPreviewImage(data.profile_img);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("owner_name", editedProfile.owner_name);
      formData.append("salon_name", editedProfile.salon_name);
      formData.append("phone_number", editedProfile.phone_number);
      formData.append("owner_email", editedProfile.owner_email);
      formData.append("gst", editedProfile.gst);
      formData.append("salon_description", editedProfile.salon_description);

      if (selectedImageFile) {
        formData.append("profile_img", selectedImageFile);
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onSave(updatedProfile);

        // Show toast notification for success
        toast({
          title: "Profile updated successfully",
          description: "Click below to reload the page.",
          action: (
            <Button
              variant="link"
              onClick={() => window.location.reload()} // Reload the page on button click
            >
              Reload
            </Button>
          ),
          duration: 1, // Optional: customize duration
        });

        // Auto-reload the page after toast disappears
        setTimeout(() => {
          window.location.reload();
        }, 1);
      } else {
        console.error("Failed to update profile:", await response.text());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={previewImage || undefined}
            alt={editedProfile.owner_name}
          />
          <AvatarFallback>{editedProfile.owner_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="owner_name">Owner Name</Label>
          <Input
            id="owner_name"
            name="owner_name"
            value={editedProfile.owner_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="salon_name">Salon Name</Label>
          <Input
            id="salon_name"
            name="salon_name"
            value={editedProfile.salon_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            name="phone_number"
            value={editedProfile.phone_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="owner_email">Email</Label>
          <Input
            id="owner_email"
            name="owner_email"
            type="email"
            value={editedProfile.owner_email}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="gst">GST</Label>
          <Input
            id="gst"
            name="gst"
            value={editedProfile.gst}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="salon_description">Salon Description</Label>
        <Textarea
          id="salon_description"
          name="salon_description"
          value={editedProfile.salon_description}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
