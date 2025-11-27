"use client";

import { motion } from "framer-motion";
import { Clock, UserPlus, FileText, CheckCircle } from "lucide-react";

/*
  Props:
    - activity: array of { type, message, createdAt, meta }
    - types: "expense_added", "member_added", "settlement", etc.
*/
export default function ActivityTab({ activity = [] }) {
    if (!activity.length) {
        return <div className="text-center text-gray-500 py-20">No recent activity.</div>;
    }

    const IconFor = (type) => {
        switch (type) {
            case "member_added": return <UserPlus />;
            case "expense_added": return <FileText />;
            case "settlement": return <CheckCircle />;
            default: return <Clock />;
        }
    };

    return (
        <div className="space-y-3">
            {activity.map((a, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl shadow flex gap-3">
                    <div className="text-gray-500">{IconFor(a.type)}</div>
                    <div>
                        <div className="font-medium text-gray-900">{a.message}</div>
                        <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
