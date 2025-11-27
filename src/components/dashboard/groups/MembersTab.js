"use client";

import { motion } from "framer-motion";
import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/*
  Props:
    - members: group.members array (member objects as in Group schema)
    - groupId: current group id
    - onMemberAdded(member) callback
    - reload callback to refresh parent data
*/
export default function MembersTab({ members = [], groupId, onMemberAdded, reload }) {
    const [showModal, setShowModal] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);

    // API expectation:
    // POST /api/groups/add-member { groupId, identifier }
    // Backend should: check identifier (email/username/contact), if found add registered user,
    // else create a custom member object in Group.members with type: "custom", store name/email/contact if provided.
    const handleAdd = async () => {
        if (!identifier.trim()) return toast.error("Enter email / username / contact");
        try {
            setLoading(true);
            const res = await axios.post("/api/groups/add-member", {
                groupId,
                identifier: identifier.trim(),
            });
            toast.success(res.data.message || "Member added");
            setIdentifier("");
            setShowModal(false);
            onMemberAdded?.(res.data.member);
            reload?.();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to add member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users size={20} />
                    Members
                </h2>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <UserPlus size={18} />
                    Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((m) => (
                    <motion.div
                        key={m._id || m.userId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white rounded-xl shadow flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold">
                                {(m.name || m.fullName || (m.userId && m.userId.fullName) || m.userId?.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">
                                    {m.name || m.fullName || m.userId?.fullName || m.userId?.username || "Unknown"}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {m.email || m.contact || m.userId?.email || "Custom user"}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.role === "admin" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}>
                                {m.role}
                            </span>
                            <small className="text-xs text-gray-400 mt-2">{new Date(m.joinedAt || m.createdAt || Date.now()).toLocaleDateString()}</small>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-3">Add Member</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter email, username or contact. If the user doesn't exist a custom member will be created in the group.
                        </p>

                        <input
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="email@example.com or username or 9876543210"
                            className="w-full border rounded-lg px-3 py-2 mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="text-gray-700">Cancel</button>
                            <button onClick={handleAdd} disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded-lg">
                                {loading ? "Adding..." : "Add Member"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
