import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CreateSessionForm = ({ onClose, onSuccess }) => {
  const [role, setRole] = useState("");
  const [topicsToFocus, setTopicsToFocus] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); 

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // 1. Generate questions
    const aiResponse = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUESTIONS,
      {
        role,
        experience,
        topicsToFocus,
        numberOfQuestions: 10,
      }
    );

    const generatedQuestions = aiResponse.data.questions;

    // 2. Create session
    const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
      role,
      topicsToFocus,
      experience,
      description,
      questions: generatedQuestions,
    });

    // 3. Redirect
    if (response.data?.session?._id) {
      onSuccess(response.data.session._id);
      navigate(`/interview-prep/${response.data.session._id}`);
    } else {
      toast.error("Failed to create session. Please try again.");
    }
  } catch (error) {
    console.error("Error creating session:", error);
    toast.error(error.response?.data?.message || "Something went wrong.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow-lg"
    >
      {/* Role */}
      <div>
        <label className="block text-sm font-medium">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter role"
          required
        />
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium">Topics to Focus</label>
        <input
          type="text"
          value={topicsToFocus}
          onChange={(e) => setTopicsToFocus(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter topics"
          required
        />
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium">Experience (years)</label>
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter experience"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter description"
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create Session"}
      </button>
    </form>
  );
};

export default CreateSessionForm;
