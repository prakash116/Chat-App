import React from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Link } from "react-router-dom";
import { IoSettings } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import { FiMessageSquare } from "react-icons/fi";
import { FaUser } from "react-icons/fa";

function Navbar() {
  const { logout, authUser } = useAuthStore();
  return (
    <>
      <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiMessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold">Chatty</h1>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className={`btn btn-sm gap-2 transition-colors`}
              >
                <IoSettings className="w-5 h-5" />
                <span className="hidden sm:inline">Setting</span>
              </Link>
              {authUser && (
                <>
                  <Link to="/profile" className={`btn btn-sm gap-2`}>
                    <FaUser className="w-5 h-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button onClick={logout}>
                    <Link to="/login" className="flex items-center gap-2">
                      <BiLogOut className="w-5 h-5" />
                      <span className="hidden sm:inline text-red-600 font-bold">
                        Logout
                      </span>
                    </Link>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
