// expenses: [{ paidBy: userId, amount, splitAmong: [userId, ...] }]
// returns array of { from, to, amount }
export function calculateBalances(members, expenses) {
    // members: [{ _id, name }]
    const balance = {};
    members.forEach(m => balance[m._id] = 0);

    for (const ex of expenses) {
        const total = ex.amount;
        const per = total / ex.splitAmong.length;

        // payer gets +total, then owes per for each participant (including maybe self)
        balance[ex.paidBy] += total;
        for (const u of ex.splitAmong) {
            balance[u] -= per;
        }
    }

    // Now convert to list and sort
    const creditors = [], debtors = [];
    for (const [id, amt] of Object.entries(balance)) {
        const rounded = Math.round((amt + Number.EPSILON) * 100) / 100;
        if (rounded > 0.01) creditors.push({ id, amt: rounded });
        else if (rounded < -0.01) debtors.push({ id, amt: -rounded }); // store positive debt
    }

    creditors.sort((a,b)=>b.amt - a.amt);
    debtors.sort((a,b)=>b.amt - a.amt);

    const tx = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const d = debtors[i];
        const c = creditors[j];
        const settle = Math.min(d.amt, c.amt);
        tx.push({ from: d.id, to: c.id, amount: Math.round(settle*100)/100 });
        d.amt -= settle;
        c.amt -= settle;
        if (d.amt <= 0.01) i++;
        if (c.amt <= 0.01) j++;
    }

    return { balance, transactions: tx };
}
