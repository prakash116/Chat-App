import React, { useState } from "react";
import { FiEye, FiEyeOff, FiMessageSquare } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { Loader2 } from "lucide-react";
import { data, Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isSigningUp } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData)
};

  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* left Side */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FiMessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Welcome Back, Login</h1>
              </div>
            </div>
            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label htmlFor="">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className={`input input-bordered w-full pl-10`}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-control">
                <label htmlFor="">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TbLockPassword className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10`}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEye className="size-5 text-base-content/40" />
                    ) : (
                      <FiEyeOff className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading ...
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>
            <div className="text-center">
              <p className="text-base-content/60">
                  Create a new account?{" "}
                <Link to="/signup" className="link link-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
        {/* Right Side */}
        <AuthImagePattern 
          tittle = "join our Community"
          subtitle = "Connect with friends, share moment, and stay, in touch with your friends"
      />
      </div>
    </>
  );
}

export default LoginPage;
