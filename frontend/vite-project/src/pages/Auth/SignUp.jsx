import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);        // local file
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // server URL
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !validateEmail(email) || !password) {
      setError("Please fill all fields correctly.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let profileImageUrl = uploadedImageUrl;

      // Upload profile image if selected
      if (profilePic) {
        const formData = new FormData();
        formData.append("image", profilePic);

        const res = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_IMAGE, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        profileImageUrl = res.data?.imgUploadRes?.imageUrl;
        setUploadedImageUrl(profileImageUrl);
      }

      // Register user
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        ...(profileImageUrl && { profileImageUrl }),
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup error:", err.response || err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center bg-white">
      <h3 className="text-lg font-semibold text-black">Create an Account</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        Join us today by entering your details below.
      </p>

      <form onSubmit={handleSignUp}>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
          <Input
            value={fullName}
            onChange={({ target }) => setFullName(target.value)}
            label="Full Name"
            placeholder="John"
            type="text"
          />

          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="email"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 Characters"
            type="password"
          />
        </div>

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button
          type="submit"
          className={`w-full py-2 rounded-lg shadow-md text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 transition"
          }`}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "SIGN UP"}
        </button>

        <p className="text-[13px] text-slate-800 mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline cursor-pointer"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
