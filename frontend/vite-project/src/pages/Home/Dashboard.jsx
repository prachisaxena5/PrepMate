import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { CARD_BG } from "../../utils/data";
import SummaryCard from "../../components/Cards/SummaryCard";
import moment from "moment";
import Modal from "../../components/Modal";
import CreateSessionForm from "./CreateSessionForm";

const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      console.log("Sessions API Response:", response.data);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching session data", error);
      toast.error("Failed to fetch sessions.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionId));
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success("Session deleted successfully!");
    } catch (error) {
      console.error("Error deleting session", error);
      toast.error("Failed to delete session.");
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto pt-4 pb-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading sessions...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-6">
            {sessions?.map((data, index) => (
              <SummaryCard
                key={data?._id || index}
                colors={CARD_BG[index % CARD_BG.length]}
                role={data?.role || ""}
                topicsToFocus={data?.topicsToFocus || ""}
                experience={data?.experience || "-"}
                questions={data?.questions || []}
                description={data?.description || ""}
                lastUpdated={
                  data?.updatedAt
                    ? moment(data.updatedAt).format("DD MM YYYY")
                    : ""
                }
                onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                onDelete={() => setOpenDeleteAlert({ open: true, data })}
              />
            ))}
          </div>
        )}

        {/* Add New Button */}
        <button
          className="h-12 md:h-12 flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed bottom-10 md:bottom-20 right-10 md:right-20"
          onClick={() => setOpenCreateModel(true)}
        >
          <LuPlus className="text-2xl text-white" />
          Add New
        </button>
      </div>

      {/* Create Session Modal */}
      <Modal
        isopen={openCreateModel}
        onClose={() => setOpenCreateModel(false)}
        hideHeader
      >
        <div>
          <CreateSessionForm
            onClose={() => setOpenCreateModel(false)}
            onSuccess={(newSessionId) => {
              setOpenCreateModel(false);
              navigate(`/interview-prep/${newSessionId}`);
            }}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isopen={openDeleteAlert.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
      >
        <div className="p-6 text-center">
          <p className="text-lg font-semibold mb-4">
            Are you sure you want to delete this session?
          </p>
          <div className="flex justify-center gap-4">
            <button
            type="button"
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => setOpenDeleteAlert({ open: false, data: null })}
            >
              Cancel
            </button>
            <button
            type="button"
             className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => {
                deleteSession(openDeleteAlert.data._id);
                setOpenDeleteAlert({ open: false, data: null });
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
