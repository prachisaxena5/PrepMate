import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type, className = "" }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4 w-full">
      {/* Label */}
      <label className="block text-[13px] text-slate-800 mb-1">{label}</label>

      {/* Input Wrapper */}
      <div
        className={`flex items-center border border-gray-300 rounded-md px-3 py-2 
        bg-white hover:border-black-500 focus-within:border-blue-600 
        focus-within:shadow-md transition duration-200 ${className}`}
      >
        {/* Input Field */}
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-gray-800"
          value={value}
          onChange={(e) => onChange(e)}
        />

        {/* Password Toggle */}
        {type === "password" && (
          <>
            {showPassword ? (
              <FaRegEye
                size={22}
                className="text-blue-600 cursor-pointer"
                onClick={toggleShowPassword}
              />
            ) : (
              <FaRegEyeSlash
                size={22}
                className="text-slate-400 cursor-pointer"
                onClick={toggleShowPassword}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
