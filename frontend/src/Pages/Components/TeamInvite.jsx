import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { APIURL } from "@/url.config";

export function InviteDrawer({ open, onOpenChange, addTeamMember }) {
  const form = useForm();
  const businessId = localStorage.getItem("businessId");

  // Reset the form whenever the drawer is opened
  useEffect(() => {
    if (open) {
      form.reset(); // Clear form fields when the drawer is opened
    }
  }, [open, form]);

  const onSubmit = async (data) => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`;

      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append("business_id", businessId);
      formData.append("first_name", data.firstName);
      formData.append("last_name", data.lastName);
      formData.append("member_name", fullName);
      formData.append("phone_number", data.phoneNumber);
      formData.append("member_email", data.email);
      formData.append(
        "date_of_joining",
        new Date().toISOString().split("T")[0]
      ); // Current date
      formData.append("access_type", data.accessType);
      formData.append("is_available", true);

      // Append the profile image file if it exists
      if (data.profileImg && data.profileImg[0]) {
        formData.append("profile_img", data.profileImg[0]);
      }

      const response = await fetch(`${APIURL}/api/team-members/`, {
        method: "POST",
        body: formData, // Use FormData instead of JSON
      });

      if (response.ok) {
        const newMember = await response.json();
        addTeamMember(newMember); // Update the team list dynamically
        form.reset(); // Clear the form
        onOpenChange(false); // Close the drawer
        alert("Team member added successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1);
      } else {
        alert("Failed to add team member. Please try again.");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col h-[90vh] p-6">
        <div className="flex items-center justify-between mb-6">
          <DrawerHeader className="p-0">
            <DrawerTitle className="text-xl font-semibold">
              Invite team member
            </DrawerTitle>
          </DrawerHeader>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Add a file input for profile image upload */}
            <FormField
              control={form.control}
              name="profileImg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*" // Accept only image files
                      onChange={(e) => {
                        field.onChange(e.target.files); // Update form value with selected file(s)
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4 mt-6">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Send Invite
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
