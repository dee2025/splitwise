import ExpensesTab from "@/components/dashboard/groups/ExpensesTab";
import MembersTab from "@/components/dashboard/groups/MembersTab";
import BalancesTab from "@/components/dashboard/groups/BalancesTab";
// import ActivityTab from "@/components/dashboard/groups/ActivityTab";
import SettlementTab from "@/components/dashboard/groups/SettlementTab";

export default function GroupPageWrapper({ group, setGroup, expenses, setExpenses, activity, settlements, reload }) {
    return (
        <div>
            {/* tabs selection logic ... */}
            <ExpensesTab
                expenses={expenses}
                group={group}
                onExpenseUpdated={(updated) => setExpenses(prev => prev.map(e => e._id === updated._id ? updated : e))}
            />

            <MembersTab
                members={group.members}
                groupId={group._id}
                reload={reload}
                onMemberAdded={(m) => setGroup(prev => ({ ...prev, members: [...prev.members, m] }))}
            />

            <BalancesTab
                members={group.members}
                expenses={expenses}
                onSettle={async (from, to, amount) => {
                    // call backend to create settlement
                    await fetch("/api/settlements/create", { method: "POST", body: JSON.stringify({ groupId: group._id, from, to, amount }) });
                    reload();
                }}
            />

            {/* <ActivityTab activity={activity} /> */}

            <SettlementTab settlements={settlements} onRefresh={reload} />
        </div>
    );
}
