import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import Drawer from '../../components/Loader/Drawer';

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false); // loader for explanation
  const [isUpdateLoader, setIsUpdateLoader] = useState(false); // loader for "Load More"

  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      console.log("API Response:", response.data.sessions);

      if (response.data && response.data.sessions) {
        setSessionData(response.data.sessions);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  // Generate concept explanation
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data) {
        console.log("Explanation:", response.data);
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, try again later");
      console.error("Error generating explanation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pin/unpin question
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log("Pin response:", response);

      if (response.data && response.data.question) {
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error("Error pinning question:", error);
    }
  };

  // Upload more questions
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      // Call AI to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data.questions;

      // Save generated Q&A to session
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Added more Q&A!");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
  }, [sessionId]);

  return (
    <DashboardLayout>
      {/* Role Header */}
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("DD/MM/YYYY")
            : ""
        }
      />

      {/* Questions List */}
      <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
        <h2 className="text-lg font-semibold color-black">Interview Q & A</h2>

        <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
          <div
            className={`col-span-12 ${
              openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
            }`}
          >
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => (
                <motion.div
                  key={data._id || index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 8 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 15,
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                >
                  <>
                    <QuestionCard
                      question={data?.question}
                      answer={data?.answer}
                      onLearnMore={() =>
                        generateConceptExplanation(data.question)
                      }
                      isPinned={data?.isPinned}
                      onTogglePin={() => toggleQuestionPinStatus(data._id)}
                    />

                    {/* Load More Button */}
                    {!isLoading &&
                      sessionData?.questions?.length === index + 1 && (
                        <div className="flex items-center justify-center mt-5">
                          <button
                            className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer"
                            disabled={isLoading || isUpdateLoader}
                            onClick={uploadMoreQuestions}
                          >
                            {isUpdateLoader ? (
                              <div className="flex items-center gap-2">
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <>
                                <LuListCollapse className="text-lg" />
                                <span>Load More</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                  </>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Drawer for explanation */}
        <div>
          <Drawer 
  isOpen={openLeanMoreDrawer}
  onClose={() => setOpenLeanMoreDrawer(false)}
  title={!isLoading && explanation?.title}
>
  {errorMsg && (
    <p className='flex gap-2 text-sm text-amber-600 font-medium'>
      <LuCircleAlert className='mt-1'/> {errorMsg}
    </p>
  )}
  {isLoading && <SkeletonLoader />}
  {!isLoading && explanation && (
    <div className="max-w-4xl mx-auto">
      {explanation.sections.map((sec, idx) => (
        <div key={idx} className="mb-4">
          <h3 className="font-semibold text-lg">{sec.heading}</h3>
          <ReactMarkdown>{sec.explanation}</ReactMarkdown>
        </div>
      ))}
    </div>
  )}
</Drawer>    
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
