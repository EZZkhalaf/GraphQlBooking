import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h1 className="text-white text-xl font-semibold">Event Project</h1>

          {/* Nav Links */}
          <ul className="flex space-x-6">
            <li>
              <NavLink
                to="/auth"
                className={({ isActive }) =>
                  isActive
                    ? "text-white font-semibold border-b-2 border-white"
                    : "text-gray-300 hover:text-white transition duration-200"
                }
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  isActive
                    ? "text-white font-semibold border-b-2 border-white"
                    : "text-gray-300 hover:text-white transition duration-200"
                }
              >
                Events
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  isActive
                    ? "text-white font-semibold border-b-2 border-white"
                    : "text-gray-300 hover:text-white transition duration-200"
                }
              >
                Booking
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
