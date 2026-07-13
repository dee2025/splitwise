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
  ImageIcon,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Receipt,
  Save,
  ShieldCheck,
  Upload,
  User,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function formatMoney(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatMemberSince(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function ProfileField({
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
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors ${
            disabled
              ? "cursor-not-allowed border-white/8 bg-slate-800/60 text-slate-400"
              : "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          }`}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ProfileTextarea({
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
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
        {!disabled && maxLength && (
          <span className="text-xs text-slate-500">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <textarea
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          placeholder={disabled ? "" : "Add a short note about yourself"}
          className={`w-full resize-none rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors ${
            disabled
              ? "cursor-not-allowed border-white/8 bg-slate-800/60 text-slate-400"
              : "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          }`}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/8 bg-slate-900 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-100">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-white/8 bg-slate-900"
    >
      <button
        type="button"
        onClick={() => collapsible && setOpen((value) => !value)}
        className={`flex w-full items-center justify-between gap-4 border-b border-white/8 px-4 py-4 text-left ${
          collapsible
            ? "transition-colors hover:bg-slate-800/70"
            : "cursor-default"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
            <Icon className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-100">{title}</h2>
            {description && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {collapsible && (
          <span className="shrink-0 text-slate-500">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="section-content"
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
    </motion.section>
  );
}

function PasswordInput({
  fieldKey,
  label,
  placeholder,
  pwForm,
  setPwForm,
  showPw,
  setShowPw,
  setPwError,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={showPw[fieldKey] ? "text" : "password"}
          value={pwForm[fieldKey]}
          onChange={(event) => {
            setPwForm((previous) => ({
              ...previous,
              [fieldKey]: event.target.value,
            }));
            setPwError("");
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
          required
        />
        <button
          type="button"
          onClick={() =>
            setShowPw((previous) => ({
              ...previous,
              [fieldKey]: !previous[fieldKey],
            }))
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-200"
          title={showPw[fieldKey] ? "Hide password" : "Show password"}
        >
          {showPw[fieldKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function ModalShell({ title, description, icon: Icon, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 pb-20 backdrop-blur-sm sm:pb-4">
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <div className="border-b border-white/8 bg-slate-800/80 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/25 bg-indigo-500/10">
                <Icon className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-100">{title}</h2>
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col gap-2 border-t border-white/8 bg-slate-800/60 px-5 py-4 sm:flex-row">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function EditProfileModal({
  editForm,
  profile,
  savingInfo,
  uploadingAvatar,
  setEditForm,
  onUploadAvatar,
  onCancel,
  onSave,
}) {
  return (
    <ModalShell
      title="Edit Profile"
      description="Update your visible profile details."
      icon={Edit3}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={savingInfo}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-60"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={savingInfo}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            {savingInfo ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {savingInfo ? "Saving" : "Save Changes"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Profile Image
          </label>
          <div className="grid grid-cols-[80px_1fr] gap-3 rounded-xl border border-white/8 bg-slate-950 p-3">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-800">
              {editForm.avatar ? (
                <img
                  src={editForm.avatar}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-500/35 bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploadingAvatar ? "Uploading" : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={(event) => {
                    onUploadAvatar(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {editForm.avatar && (
                <button
                  type="button"
                  onClick={() => setEditForm((previous) => ({ ...previous, avatar: "" }))}
                  className="ml-2 text-xs font-semibold text-slate-400 hover:text-rose-300"
                >
                  Remove
                </button>
              )}
              <p className="truncate text-xs text-slate-500">
                {editForm.avatar || "JPG, PNG, WebP, or GIF up to 5MB"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileField
            icon={User}
            label="Full Name"
            name="fullName"
            value={editForm.fullName}
            onChange={(event) =>
              setEditForm((previous) => ({
                ...previous,
                fullName: event.target.value,
              }))
            }
          />
          <ProfileField
            icon={Mail}
            label="Email Address"
            name="email"
            value={profile?.email || ""}
            onChange={() => {}}
            disabled
            hint="Email address cannot be changed here"
          />
          <ProfileField
            icon={User}
            label="Username"
            name="username"
            value={editForm.username}
            onChange={(event) =>
              setEditForm((previous) => ({
                ...previous,
                username: event.target.value,
              }))
            }
            hint="Use 3-20 letters, numbers, or underscores"
          />
          <ProfileField
            icon={Phone}
            label="Phone Number"
            name="contact"
            value={editForm.contact}
            onChange={(event) =>
              setEditForm((previous) => ({
                ...previous,
                contact: event.target.value,
              }))
            }
          />
        </div>

        <ProfileTextarea
          icon={FileText}
          label="Bio"
          maxLength={200}
          value={editForm.bio}
          onChange={(event) =>
            setEditForm((previous) => ({
              ...previous,
              bio: event.target.value,
            }))
          }
        />
      </div>
    </ModalShell>
  );
}

function ChangePasswordModal({
  pwForm,
  setPwForm,
  showPw,
  setShowPw,
  pwChecks,
  pwError,
  setPwError,
  savingPw,
  onCancel,
  onSubmit,
}) {
  return (
    <ModalShell
      title="Change Password"
      description="Use your current password to set a new one."
      icon={KeyRound}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={savingPw}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-60"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            form="change-password-form"
            disabled={
              savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPw ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <KeyRound size={16} />
            )}
            {savingPw ? "Changing" : "Change Password"}
          </button>
        </>
      }
    >
      <form id="change-password-form" onSubmit={onSubmit} className="space-y-4">
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
          <PasswordInput
            key={key}
            fieldKey={key}
            label={label}
            placeholder={placeholder}
            pwForm={pwForm}
            setPwForm={setPwForm}
            showPw={showPw}
            setShowPw={setShowPw}
            setPwError={setPwError}
          />
        ))}

        {pwForm.next && (
          <div className="flex flex-wrap gap-1.5">
            {pwChecks.map(({ ok, label }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${
                  ok
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                    : "border-white/8 bg-slate-800 text-slate-500"
                }`}
              >
                {ok && <Check size={11} />}
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
              className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              <X size={14} className="shrink-0" />
              {pwError}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </ModalShell>
  );
}

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

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    contact: "",
    bio: "",
    avatar: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/profile");
        if (!mounted) return;

        const user = res.data.user;
        setProfile(user);
        setStats(res.data.stats);
        setEditForm({
          fullName: user.fullName || "",
          username: user.username || "",
          contact: user.contact || "",
          bio: user.bio || "",
          avatar: user.avatar || "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveInfo = async () => {
    if (!editForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!editForm.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(editForm.username)) {
      toast.error("Username must be 3-20 chars (letters, numbers, underscore)");
      return;
    }

    setSavingInfo(true);
    try {
      const res = await axios.put("/api/users/profile", {
        fullName: editForm.fullName.trim(),
        username: editForm.username.trim(),
        contact: editForm.contact.trim(),
        bio: editForm.bio.trim(),
        avatar: editForm.avatar || null,
      });
      const updated = res.data.user;
      setProfile((previous) => ({ ...previous, ...updated }));
      dispatch(
        updateUser({
          fullName: updated.fullName,
          username: updated.username,
          contact: updated.contact,
          avatar: updated.avatar,
        }),
      );
      toast.success("Profile updated");
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: profile?.fullName || "",
      username: profile?.username || "",
      contact: profile?.contact || "",
      bio: profile?.bio || "",
      avatar: profile?.avatar || "",
    });
    setEditMode(false);
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profile");

    setUploadingAvatar(true);
    try {
      const res = await axios.post("/api/uploads/image", formData);
      setEditForm((previous) => ({ ...previous, avatar: res.data.path }));
      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to upload image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePw = async (event) => {
    event.preventDefault();
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
      toast.success("Password changed");
      setPwForm({ current: "", next: "", confirm: "" });
      setShowPasswordModal(false);
    } catch (error) {
      setPwError(error.response?.data?.error || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      fullName: profile?.fullName || "",
      username: profile?.username || "",
      contact: profile?.contact || "",
      bio: profile?.bio || "",
      avatar: profile?.avatar || "",
    });
    setEditMode(true);
  };

  const closePasswordModal = () => {
    if (savingPw) return;
    setShowPasswordModal(false);
    setPwError("");
    setPwForm({ current: "", next: "", confirm: "" });
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

  if (loadingProfile) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-xl border border-white/8 bg-slate-900 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 animate-pulse rounded-xl bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-5 w-44 animate-pulse rounded bg-slate-800" />
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-800" />
                </div>
              </div>
              <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-800" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-white/8 bg-slate-900"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <div className="h-96 animate-pulse rounded-xl border border-white/8 bg-slate-900" />
            <div className="h-96 animate-pulse rounded-xl border border-white/8 bg-slate-900" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = profile?.fullName || authUser?.fullName || "User";
  const username = profile?.username || authUser?.username || "user";
  const memberSince = profile?.createdAt
    ? formatMemberSince(profile.createdAt)
    : "Not available";
  const accountId = profile?._id?.toString().slice(-8).toUpperCase() || "N/A";
  const role = profile?.role || authUser?.role || "user";

  const pwChecks = [
    { ok: pwForm.next.length >= 6, label: "6+ chars" },
    { ok: /[A-Z]/.test(pwForm.next), label: "Uppercase" },
    { ok: /[0-9]/.test(pwForm.next), label: "Number" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-xl border border-white/8 bg-slate-900"
        >
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    className="h-20 w-20 rounded-xl border border-indigo-500/25 object-cover shadow-lg shadow-indigo-950/40"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/15 text-2xl font-bold text-indigo-100 shadow-lg shadow-indigo-950/40">
                    {initials(displayName)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-slate-900 bg-emerald-500" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Active account
                </div>
                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {displayName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4" />@{username}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {profile?.email || authUser?.email || "No email"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Since {memberSince}
                  </span>
                </div>
                {profile?.bio && (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                {loggingOut ? "Logging out" : "Logout"}
              </button>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Groups"
            value={stats.groupsCount}
            detail="joined workspaces"
            tone="border-sky-500/25 bg-sky-500/10 text-sky-300"
            delay={0.04}
          />
          <StatCard
            icon={Receipt}
            label="Expenses"
            value={stats.expenseCount}
            detail="paid or split"
            tone="border-indigo-500/25 bg-indigo-500/10 text-indigo-300"
            delay={0.08}
          />
          <StatCard
            icon={WalletCards}
            label="Total Tracked"
            value={formatMoney(stats.totalExpenses)}
            detail="all profile activity"
            tone="border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
            delay={0.12}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <Section
            title="Profile Details"
            description="The information visible across your groups"
            icon={User}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { label: "Full Name", value: profile?.fullName || "Not set" },
                  { label: "Username", value: `@${username}` },
                  { label: "Email", value: profile?.email || "No email" },
                  { label: "Phone", value: profile?.contact || "Not added" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/8 bg-slate-800/70 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-100">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-white/8 bg-slate-800/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bio
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {profile?.bio || "No bio added yet."}
                </p>
              </div>

              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 sm:w-auto"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </Section>

          <div className="space-y-4">
            <Section
              title="Account Info"
              description="Read-only account metadata"
              icon={ShieldCheck}
            >
              <div className="divide-y divide-white/8">
                {[
                  { label: "Account ID", value: accountId, mono: true },
                  {
                    label: "Role",
                    value: role.charAt(0).toUpperCase() + role.slice(1),
                  },
                  { label: "Member Since", value: memberSince },
                  { label: "Phone", value: profile?.contact || "Not added" },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </span>
                    <span
                      className={`max-w-[60%] truncate text-right text-sm font-semibold text-slate-200 ${
                        mono
                          ? "rounded-md border border-white/8 bg-slate-800 px-2 py-1 font-mono text-xs"
                          : ""
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Security"
              description="Manage password and account access"
              icon={KeyRound}
            >
              <div className="space-y-3">
                <div className="rounded-lg border border-white/8 bg-slate-800/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Keep your account protected by updating your password from a
                    focused modal dialog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <KeyRound size={16} />
                  Change Password
                </button>
              </div>
            </Section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editMode && (
          <EditProfileModal
            editForm={editForm}
            profile={profile}
            savingInfo={savingInfo}
            uploadingAvatar={uploadingAvatar}
            setEditForm={setEditForm}
            onUploadAvatar={handleAvatarUpload}
            onCancel={handleCancelEdit}
            onSave={handleSaveInfo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal
            pwForm={pwForm}
            setPwForm={setPwForm}
            showPw={showPw}
            setShowPw={setShowPw}
            pwChecks={pwChecks}
            pwError={pwError}
            setPwError={setPwError}
            savingPw={savingPw}
            onCancel={closePasswordModal}
            onSubmit={handleChangePw}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
