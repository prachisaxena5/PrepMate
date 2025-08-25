import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/");
  };

  return (
    user && (
      <div className="flex items-center mr-3 mt-2 w-full max-w-xs justify-evenly">
        {/* Username */}
        <div className="text-black font-bold text-[18px] leading-3">
          {user.name || ""}
        </div>

        {/* Logout Button */}
        <button
          className="text-amber-700 text-sm font-semibold cursor-pointer hover:underline"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    )
  );
};

export default ProfileInfoCard;
