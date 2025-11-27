"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Image as ImageIcon,
  IndianRupee,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ExpenseDetailsModal({ expense, onClose, onUpdate }) {
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const handleCommentSubmit = async () => {
    try {
      const res = await axios.post("/api/expenses/comment", {
        expenseId: expense._id,
        comment,
      });

      onUpdate(res.data.expense);
      setComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleImageUpload = async () => {
    if (!image) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("expenseId", expense._id);

    try {
      const res = await axios.post("/api/expenses/upload-image", formData);

      onUpdate(res.data.expense);
      setImage(null);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const handleMarkPaid = async () => {
    try {
      setMarkingPaid(true);
      const res = await axios.post("/api/expenses/mark-paid", {
        expenseId: expense._id,
        userId: currentUserId,
        method: "upi",
        notes: "Paid via GPay",
      });

      onUpdate(res.data.expense);
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to update");
    } finally {
      setMarkingPaid(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-xl relative"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {expense.title}
          </h2>

          <p className="text-gray-600 mb-4">{expense.description}</p>

          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
            <IndianRupee size={20} />
            {expense.amount}
          </div>

          {/* IMAGE UPLOAD */}
          <div className="mb-6">
            <label className="font-semibold">Upload Image</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="border p-2 rounded-lg"
              />
              <button
                className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                onClick={handleImageUpload}
              >
                <ImageIcon size={16} />
              </button>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="mb-6">
            <label className="font-semibold">Add Comment</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="text"
                className="border flex-1 p-2 rounded-lg"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                onClick={handleCommentSubmit}
              >
                <Send size={16} />
              </button>
            </div>

            {/* Show existing comments */}
            <div className="mt-4 space-y-2">
              {expense.comments?.map((c, i) => (
                <div
                  key={i}
                  className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* MARK AS PAID */}
          <button
            onClick={handleMarkPaid}
            disabled={markingPaid}
            className="flex w-full items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
          >
            <CheckCircle size={20} />
            {markingPaid ? "Processing..." : "Mark as Paid"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
