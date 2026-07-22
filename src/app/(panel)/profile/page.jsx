"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { logout, updateUser } from "@/redux/slices/authSlice";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Check,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  ImageIcon,
  IndianRupee,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Moon,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
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

function SettingsRow({
  icon: Icon,
  title,
  description,
  iconTone = "bg-emerald-500/10 text-emerald-300",
  value,
  danger = false,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-800/70"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-bold ${
            danger ? "text-rose-300" : "text-slate-100"
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">
          {description}
        </span>
      </span>
      {children || (
        <span className="flex shrink-0 items-center gap-2">
          {value && (
            <span className="text-xs font-bold text-emerald-300">
              {value}
            </span>
          )}
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </span>
      )}
    </button>
  );
}

function ThemeToggle({ checked, onChange }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onChange();
        }
      }}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
        checked
          ? "border-indigo-500/30 bg-indigo-600"
          : "border-white/10 bg-slate-800"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user: authUser } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
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
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/profile");
        if (!mounted) return;

        const user = res.data.user;
        setProfile(user);
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
        <div className="w-full min-w-0 space-y-6">
          <div className="rounded-xl border border-white/8 bg-slate-900 p-5">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 animate-pulse rounded-full bg-slate-800" />
              <div className="space-y-2">
                <div className="h-5 w-44 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-800" />
                <div className="h-5 w-16 animate-pulse rounded bg-slate-800" />
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/8 bg-slate-900">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 border-b border-white/8 px-4 py-4 last:border-b-0"
              >
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
                  <div className="h-3 w-48 animate-pulse rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = profile?.fullName || authUser?.fullName || "User";
  const email = profile?.email || authUser?.email || "No email";
  const isDarkMode = themeMounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDarkMode ? "light" : "dark");

  const pwChecks = [
    { ok: pwForm.next.length >= 6, label: "6+ chars" },
    { ok: /[A-Z]/.test(pwForm.next), label: "Uppercase" },
    { ok: /[0-9]/.test(pwForm.next), label: "Number" },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto w-full min-w-0 max-w-2xl space-y-5 pb-24 sm:pb-6">
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/8 bg-slate-900 p-5"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border border-emerald-500/20 object-cover shadow-lg shadow-emerald-950/30"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/15 text-2xl font-bold text-emerald-100 shadow-lg shadow-emerald-950/30">
                  {initials(displayName)}
                </div>
              )}
              <button
                type="button"
                onClick={openEditModal}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-900 bg-emerald-500 text-white shadow-lg transition-colors hover:bg-emerald-400"
                title="Update profile photo"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-100">
                {displayName}
              </h1>
              <p className="mt-1 truncate text-sm font-medium text-slate-500">
                {email}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
          </div>
        </motion.section>

        <section className="space-y-2">
          <h2 className="px-1 text-sm font-extrabold text-slate-500">
            Settings
          </h2>
          <div className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-lg shadow-black/10">
            <SettingsRow
              icon={User}
              title="Personal Info"
              description="Update your personal details"
              onClick={openEditModal}
            />
            <SettingsRow
              icon={Bell}
              title="Notifications"
              description="Manage your notification preferences"
              iconTone="bg-emerald-500/10 text-emerald-300"
              onClick={() => router.push("/notifications")}
            />
            <SettingsRow
              icon={IndianRupee}
              title="Currency"
              description="Choose your preferred currency"
              value="INR"
              onClick={() => toast("Currency settings are coming soon")}
            />
          </div>
        </section>

        <section className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-lg shadow-black/10">
          <SettingsRow
            icon={Moon}
            title="Dark Mode"
            description="Switch between light and dark theme"
            onClick={toggleTheme}
          >
            <ThemeToggle checked={isDarkMode} onChange={toggleTheme} />
          </SettingsRow>
          <SettingsRow
            icon={KeyRound}
            title="Security"
            description="Change your account password"
            iconTone="bg-indigo-500/10 text-indigo-300"
            onClick={() => setShowPasswordModal(true)}
          />
          <SettingsRow
            icon={Headphones}
            title="Help & Support"
            description="Get help and contact support"
            iconTone="bg-emerald-500/10 text-emerald-300"
            onClick={() => router.push("/contact")}
          />
          <SettingsRow
            icon={Shield}
            title="Privacy"
            description="Privacy policy and data settings"
            iconTone="bg-emerald-500/10 text-emerald-300"
            onClick={() => router.push("/privacy-policy")}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-lg shadow-black/10">
          <SettingsRow
            icon={Trash2}
            title="Delete Account"
            description="Permanently delete your account and data"
            iconTone="bg-rose-500/10 text-rose-300"
            danger
            onClick={() => router.push("/delete-account")}
          />
          <SettingsRow
            icon={loggingOut ? Loader2 : LogOut}
            title={loggingOut ? "Logging out" : "Logout"}
            description="Sign out from your account"
            iconTone="bg-rose-500/10 text-rose-300"
            danger
            onClick={handleLogout}
          />
        </section>
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
