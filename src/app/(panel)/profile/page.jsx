"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { logout, updateUser } from "@/redux/slices/authSlice";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  IndianRupee,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Receipt,
  Save,
  User,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

// ── helpers ───────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── reusable field row ────────────────────────────────────────────────────────
function InputRow({
  icon: Icon,
  label,
  value,
  name,
  onChange,
  disabled,
  type = "text",
  hint,
  maxLength,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-150 focus:outline-none ${
            disabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-900 focus:border-black"
          }`}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1 pl-1">{hint}</p>}
    </div>
  );
}

function TextareaRow({
  icon: Icon,
  label,
  value,
  onChange,
  disabled,
  hint,
  maxLength,
}) {
  const charCount = value?.length ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
        {!disabled && maxLength && (
          <span className="text-xs text-gray-400">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <textarea
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-150 focus:outline-none resize-none ${
            disabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-900 focus:border-black"
          }`}
          placeholder={
            disabled ? "" : "Tell your group members a bit about yourself…"
          }
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1 pl-1">{hint}</p>}
    </div>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, iconColor, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-700/50 rounded-lg border border-white/8 p-3 flex flex-col items-center gap-2 text-center hover:bg-slate-700/70 transition-colors"
    >
      <div className="p-2 rounded-lg bg-indigo-600/20">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <p className="text-lg font-bold text-slate-100 leading-tight">{value}</p>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
}

// ── collapsible section ───────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-lg border border-white/6 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 border-b border-white/6 ${
          collapsible
            ? "cursor-pointer hover:bg-slate-700/50 transition-colors"
            : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-semibold text-slate-100 text-sm">{title}</span>
        </div>
        {collapsible && (
          <span className="text-slate-400">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user: authUser } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    groupsCount: 0,
    expenseCount: 0,
    totalExpenses: 0,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // edit form
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    contact: "",
    bio: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);

  // password form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/users/profile");
        setProfile(res.data.user);
        setStats(res.data.stats);
        setEditForm({
          fullName: res.data.user.fullName,
          contact: res.data.user.contact,
          bio: res.data.user.bio ?? "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // ── save info ─────────────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!editForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSavingInfo(true);
    try {
      const res = await axios.put("/api/users/profile", {
        fullName: editForm.fullName.trim(),
        contact: editForm.contact.trim(),
        bio: editForm.bio.trim(),
      });
      const updated = res.data.user;
      setProfile((prev) => ({ ...prev, ...updated }));
      dispatch(
        updateUser({ fullName: updated.fullName, contact: updated.contact }),
      );
      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: profile.fullName,
      contact: profile.contact,
      bio: profile.bio ?? "",
    });
    setEditMode(false);
  };

  // ── change password ───────────────────────────────────────────────────────
  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.next.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("Passwords do not match");
      return;
    }

    setSavingPw(true);
    try {
      await axios.put("/api/users/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      toast.success("Password changed!");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/");
      setLoggingOut(false);
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 animate-pulse">
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-20 h-20 rounded-xl bg-gray-200 border-2 border-gray-200" />
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded border-2 border-gray-100"
                />
              ))}
            </div>
          </div>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border-2 border-gray-200 p-5 animate-pulse space-y-3"
            >
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const displayName = profile?.fullName || authUser?.fullName || "User";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "—";

  // password strength checks
  const pwChecks = [
    { ok: pwForm.next.length >= 6, label: "6+ chars" },
    { ok: /[A-Z]/.test(pwForm.next), label: "Uppercase" },
    { ok: /[0-9]/.test(pwForm.next), label: "Number" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Profile Header Card ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-lg border border-white/6 overflow-hidden"
        >
          <div className="p-6">
            {/* avatar */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-950/60">
                  {initials(displayName)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800" />
              </div>

              <div className="text-center">
                <h1 className="text-xl font-bold text-slate-100">
                  {displayName}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  @{profile?.username || authUser?.username}
                </p>
                {profile?.bio && (
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto italic">
                    "{profile.bio}"
                  </p>
                )}
              </div>

              {/* meta */}
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap justify-center font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {profile?.email || authUser?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Since {memberSince}
                </span>
              </div>
            </div>

            {/* stats row */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard
                icon={Users}
                label="Groups"
                value={stats.groupsCount}
                border="border-blue-400"
                iconColor="text-blue-600"
                delay={0.05}
              />
              <StatCard
                icon={Receipt}
                label="Expenses"
                value={stats.expenseCount}
                border="border-purple-400"
                iconColor="text-purple-600"
                delay={0.1}
              />
              <StatCard
                icon={IndianRupee}
                label="Total"
                value={`₹${(stats.totalExpenses || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                border="border-green-400"
                iconColor="text-green-600"
                delay={0.15}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Edit Profile ── */}
        <Section title="Edit Profile" icon={Edit3}>
          <div className="space-y-4">
            <InputRow
              icon={User}
              label="Full Name"
              name="fullName"
              value={editMode ? editForm.fullName : profile?.fullName || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, fullName: e.target.value }))
              }
              disabled={!editMode}
            />
            <InputRow
              icon={Mail}
              label="Email Address"
              name="email"
              value={profile?.email || ""}
              onChange={() => {}}
              disabled
              hint="Email cannot be changed"
            />
            <InputRow
              icon={User}
              label="Username"
              name="username"
              value={profile?.username || ""}
              onChange={() => {}}
              disabled
              hint="Username cannot be changed"
            />
            <InputRow
              icon={Phone}
              label="Phone Number"
              name="contact"
              value={editMode ? editForm.contact : profile?.contact || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, contact: e.target.value }))
              }
              disabled={!editMode}
            />
            <TextareaRow
              icon={FileText}
              label="Bio"
              maxLength={200}
              value={editMode ? editForm.bio : profile?.bio || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, bio: e.target.value }))
              }
              disabled={!editMode}
              hint={
                !editMode && !profile?.bio
                  ? "Add a short bio to let people know you better"
                  : undefined
              }
            />

            <div className="pt-1">
              {!editMode ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditMode(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-black rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sketch-sm"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCancelEdit}
                    disabled={savingInfo}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-gray-400 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <X size={14} />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveInfo}
                    disabled={savingInfo}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white border-2 border-black rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all shadow-sketch-sm disabled:opacity-50"
                  >
                    {savingInfo ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {savingInfo ? "Saving…" : "Save Changes"}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ── Change Password ── */}
        <Section
          title="Change Password"
          icon={KeyRound}
          collapsible
          defaultOpen={false}
        >
          <form onSubmit={handleChangePw} className="space-y-4">
            {[
              {
                key: "current",
                label: "Current Password",
                placeholder: "Enter current password",
              },
              {
                key: "next",
                label: "New Password",
                placeholder: "Min. 6 characters",
              },
              {
                key: "confirm",
                label: "Confirm New Password",
                placeholder: "Re-enter new password",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPw[key] ? "text" : "password"}
                    value={pwForm[key]}
                    onChange={(e) => {
                      setPwForm((p) => ({ ...p, [key]: e.target.value }));
                      setPwError("");
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            {/* strength pills */}
            {pwForm.next && (
              <div className="flex gap-1.5 flex-wrap">
                {pwChecks.map(({ ok, label }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      ok
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {ok && <Check size={9} />}
                    {label}
                  </span>
                ))}
              </div>
            )}

            <AnimatePresence>
              {pwError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2"
                >
                  <X size={14} className="shrink-0" />
                  {pwError}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={
                savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white border-2 border-black rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all shadow-sketch-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingPw ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <KeyRound size={14} />
              )}
              {savingPw ? "Changing…" : "Change Password"}
            </motion.button>
          </form>
        </Section>

        {/* ── Account Info (read-only) ── */}
        <Section
          title="Account Info"
          icon={User}
          collapsible
          defaultOpen={false}
        >
          <div className="space-y-0">
            {[
              {
                label: "Account ID",
                value: profile?._id?.toString().slice(-8).toUpperCase() ?? "—",
                mono: true,
              },
              {
                label: "Role",
                value:
                  (profile?.role ?? "user").charAt(0).toUpperCase() +
                  (profile?.role ?? "user").slice(1),
              },
              { label: "Member Since", value: memberSince },
              { label: "Phone", value: profile?.contact || "—" },
            ].map(({ label, value, mono }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 border-b border-dashed border-gray-200 last:border-0"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {label}
                </span>
                <span
                  className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono bg-gray-100 px-2 py-0.5 rounded text-xs" : ""}`}
                >
                  {value}
                </span>
              </div>
            ))}

            <div className="pt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm font-semibold disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                {loggingOut ? "Logging out..." : "Logout"}
              </motion.button>
            </div>
          </div>
        </Section>

        <div className="h-2" />
      </div>
    </DashboardLayout>
  );
}
