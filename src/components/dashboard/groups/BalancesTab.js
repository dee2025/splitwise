"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";

/*
  Props:
    - members: group.members array (populated with userId if registered)
    - expenses: array of Expense with splitBetween (amounts) and paidBy
    - onSettle(fromId, toId, amount) optional callback to perform settlement
*/
export default function BalancesTab({ members = [], expenses = [], onSettle }) {
    // Build balances map: memberKey -> net amount (positive means others owe them)
    const balances = {};

    // identify member id: either member.userId._id (registered) or a generated id for custom users
    const getMemberKey = (m) => (m.userId?._id || m._id || m.contact || m.email || m.name);

    members.forEach((m) => {
        balances[getMemberKey(m)] = 0;
    });

    // process expenses
    expenses.forEach((exp) => {
        // For safe reading: assume splitBetween array with objects { userId, amount, settled }
        const payerId = exp.paidBy?._id || exp.paidBy;
        // payer gets +amount
        balances[payerId] = (balances[payerId] || 0) + Number(exp.amount || 0);

        (exp.splitBetween || []).forEach((s) => {
            const uid = s.userId?._id || s.userId;
            const amt = Number(s.amount || (exp.amount / (exp.splitBetween.length || 1)));
            balances[uid] = (balances[uid] || 0) - amt;
        });
    });

    // Now split into creditors and debtors
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([id, amt]) => {
        const rounded = Math.round((amt + Number.EPSILON) * 100) / 100;
        if (rounded > 0.01) creditors.push({ id, amt: rounded });
        else if (rounded < -0.01) debtors.push({ id, amt: -rounded });
    });

    // helper to get member display name
    const findMemberName = (id) => {
        const m = members.find((mm) => (mm.userId?._id || mm._id || mm.contact || mm.email || mm.name) === id);
        return m?.name || m?.fullName || m?.userId?.fullName || m?.userId?.username || id;
    };

    // compute settlements (greedy)
    const settlements = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const d = debtors[i];
        const c = creditors[j];
        const settle = Math.min(d.amt, c.amt);
        settlements.push({ from: d.id, to: c.id, amount: Math.round(settle * 100) / 100 });
        d.amt -= settle;
        c.amt -= settle;
        if (d.amt <= 0.01) i++;
        if (c.amt <= 0.01) j++;
    }

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow">
                <h4 className="font-semibold">Net Balances</h4>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(balances).map(([id, amt]) => (
                        <div key={id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="text-sm font-medium">{findMemberName(id)}</div>
                            <div className={`font-semibold ${amt >= 0 ? "text-green-700" : "text-red-600"}`}>
                                {amt >= 0 ? `Gets ₹${amt.toFixed(2)}` : `Owes ₹${Math.abs(amt).toFixed(2)}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
                <h4 className="font-semibold">Suggested Settlements</h4>
                <div className="mt-3 space-y-2">
                    {settlements.length === 0 && <div className="text-sm text-gray-500">Everyone is settled.</div>}
                    {settlements.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                                <div className="font-medium">{findMemberName(s.from)} → {findMemberName(s.to)}</div>
                                <div className="text-xs text-gray-500">Suggested transfer</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="font-semibold">₹{s.amount.toFixed(2)}</div>
                                <button
                                    onClick={() => onSettle?.(s.from, s.to, s.amount)}
                                    className="px-3 py-1 bg-gray-900 text-white rounded"
                                >
                                    Settle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
