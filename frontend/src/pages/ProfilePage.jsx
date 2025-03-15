import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Camera } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function ProfilePage() {
  const { authUser, isUpdateingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null)
  
  const handleImageUpload = async(e) => {
    const file  = e.target.files[0]
    if (!file) return;
    const formData = new FormData()
    formData.append("profilePic", file)
    await updateProfile(formData)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async() => {
      const base64Image = reader.result
      setSelectedImg(base64Image)
    }
  };

  return (
    <>
      <div className="h-screen pt-20">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Profile</h1>
              <p className="mt-2">Your Profile Infomation</p>
            </div>
            {/* Avatar upload section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || ""}
                  alt=""
                  className="size-32 rounded-full object-cover border-4"
                />
                <label
                  htmlFor="avater-upload"
                  className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                    isUpdateingProfile
                      ? "animate-pulse pointer-events-auto"
                      : ""
                  }`}
                >
                  <Camera className="size-5 text-base-200" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    id="avater-upload"
                    onChange={handleImageUpload}
                    disabled={isUpdateingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                  {isUpdateingProfile? "Updating profile..." : "Change profile picture"}
                </p>
            </div>
            {/* Profile details */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <FaUser className="size-5"/>
                  Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                <MdEmail className="size-5"/>
                  Email
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              </div>
            </div>
            
            <div className="mt-2 bg-base-300 rou-xl p-2">
              <h2 className="text-lg font-medium mb-4">Account Infomation</h2>
              <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                    <span>Member Since</span>
                    <span>{authUser.createdAt?.split("T")[0]}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Account Status</span>
                    <span className="text-green-500">Active</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
