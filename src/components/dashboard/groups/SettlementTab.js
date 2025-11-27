"use client";

import axios from "axios";
import toast from "react-hot-toast";

/*
  Props:
    - settlements: array of Settlement docs
    - onRefresh callback
*/
export default function SettlementTab({ settlements = [], onRefresh }) {
    const markCompleted = async (id) => {
        try {
            await axios.post("/api/settlements/complete", { settlementId: id });
            toast.success("Settlement marked completed");
            onRefresh?.();
        } catch (err) {
            toast.error("Failed to update settlement");
        }
    };

    return (
        <div className="space-y-3">
            {settlements.length === 0 && <div className="text-sm text-gray-500">No settlements yet.</div>}

            {settlements.map((s) => (
                <div key={s._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                    <div>
                        <div className="font-medium">{s.fromUser?.fullName || s.fromUser?.username} → {s.toUser?.fullName || s.toUser?.username}</div>
                        <div className="text-sm text-gray-500">{s.method} • {s.notes}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="font-semibold">₹{s.amount.toFixed(2)}</div>
                        {s.status !== "completed" && (
                            <button onClick={() => markCompleted(s._id)} className="px-3 py-1 bg-green-600 text-white rounded">Complete</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
