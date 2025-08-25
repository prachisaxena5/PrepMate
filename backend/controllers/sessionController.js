import Session from "../models/Session.js";
import Question from "../models/Question.js";

// @desc Create a new session and linked questions
// @route POST /api/sessions/create
// @access Private
export const createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions = [] } = req.body;
    const userId = req.user._id;

    // Create session
    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    // Create questions only if provided
    let questionDocs = [];
    if (Array.isArray(questions) && questions.length > 0) {
      questionDocs = await Promise.all(
        questions.map(async (q) => {
          const question = await Question.create({
            session: session._id,
            question: q.question,
            answer: q.answer,
          });
          return question._id;
        })
      );
    }

    session.questions = questionDocs;
    await session.save();

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error("Error in createSession:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const sessions = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .exec();

    if (!sessions) {
      return res.status(404).json({ success: false, message: "session not found" });
    }

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("questions");

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const sessions = await Session.findById(req.params.id);

    if (!sessions) {
      return res.status(404).json({ success: false, message: "session not found" });
    }

    // check if the logged in user owns this session
    if (sessions.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this session." });
    }

    // first, delete all questions linked to this session
    await Question.deleteMany({ session: sessions._id });

    // Then delete the session
    await sessions.deleteOne();

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
