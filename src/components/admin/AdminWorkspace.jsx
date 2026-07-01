"use client";

import { slugify } from "@/lib/articleUtils";
import {
  Ban,
  BarChart3,
  Calendar,
  CheckCircle2,
  FileText,
  Eye,
  ImageIcon,
  LogOut,
  Loader2,
  PenLine,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  Undo2,
  Upload,
  UserX,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const blankArticle = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  category: "Expense Guides",
  tags: "",
  keywords: "",
  thumbnail: "/images/articles/friends-expenses.png",
  authorName: "Money Split Editorial Team",
  reviewerName: "",
  seoTitle: "",
  seoDescription: "",
  content: "",
  sources: [{ label: "", url: "" }],
  faqs: [{ question: "", answer: "" }],
  status: "draft",
};

function formatDate(value) {
  if (!value) return "Not published";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function articleToForm(article) {
  return {
    id: article.id || "",
    title: article.title || "",
    slug: article.slug || "",
    excerpt: article.excerpt || "",
    category: article.category || "Expense Guides",
    tags: article.tags?.join(", ") || "",
    keywords: article.keywords || "",
    thumbnail: article.thumbnail || "/images/articles/friends-expenses.png",
    authorName: article.authorName || "Money Split Editorial Team",
    reviewerName: article.reviewerName || "",
    seoTitle: article.seoTitle || "",
    seoDescription: article.seoDescription || "",
    content: article.content || "",
    sources: article.sources?.length ? article.sources : [{ label: "", url: "" }],
    faqs: article.faqs?.length ? article.faqs : [{ question: "", answer: "" }],
    status: article.status || "draft",
  };
}

function FieldError({ errors, name }) {
  if (!errors?.[name]) return null;
  return <p className="mt-1 text-xs text-rose-300">{errors[name]}</p>;
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-200">{value || "Not provided"}</p>
    </div>
  );
}

function UserDetailsModal({ user, onClose, onToggleBlock, onDelete, busy }) {
  if (!user) return null;

  const initials =
    user.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/60">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/8 bg-slate-900 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">User details</p>
            <h2 className="mt-1 text-xl font-bold text-slate-100">{user.fullName || "Unnamed user"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/8 hover:text-slate-100"
            aria-label="Close user details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName || user.email}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-100">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/6 px-2.5 py-1 text-xs font-semibold text-slate-300">
                    {user.role || "user"}
                  </span>
                  <span className="rounded-full bg-white/6 px-2.5 py-1 text-xs font-semibold text-slate-300">
                    {user.authProvider || "local"}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.isBlocked ? "bg-rose-500/10 text-rose-300" : "bg-emerald-500/10 text-emerald-300"
                  }`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onToggleBlock(user)}
                disabled={busy}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60 ${
                  user.isBlocked
                    ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                    : "border border-amber-400/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                }`}
              >
                {user.isBlocked ? <Undo2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(user)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/15 disabled:opacity-60"
              >
                <UserX className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoItem label="User ID" value={user.id} />
            <InfoItem label="Username" value={user.username} />
            <InfoItem label="Full name" value={user.fullName} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Contact" value={user.contact} />
            <InfoItem label="Bio" value={user.bio} />
            <InfoItem label="Role" value={user.role} />
            <InfoItem label="Auth provider" value={user.authProvider} />
            <InfoItem label="Google ID" value={user.googleId} />
            <InfoItem label="Avatar URL" value={user.avatar} />
            <InfoItem label="Created at" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : ""} />
            <InfoItem label="Updated at" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ""} />
            <InfoItem label="Blocked at" value={user.blockedAt ? new Date(user.blockedAt).toLocaleString() : ""} />
            <InfoItem label="Blocked reason" value={user.blockedReason} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminFrame({ activeTab, admin, onLogout, children }) {
  const navItems = [
    { key: "articles", label: "Articles", href: "/admin/articles", icon: FileText },
    { key: "users", label: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-white/8 bg-slate-950">
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/admin/articles" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Money Split</p>
              <p className="text-xs text-slate-500">Admin panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/6 hover:text-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-3">
          <div className="rounded-xl bg-white/[0.03] px-3 py-3">
            <p className="truncate text-xs font-semibold text-slate-200">{admin?.email}</p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/8"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin/articles" className="flex items-center gap-2 text-sm font-bold">
              <Shield className="w-4 h-4 text-indigo-300" />
              Admin
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-white/8 px-3 py-2 text-xs font-semibold text-slate-300"
            >
              Logout
            </button>
          </div>
          <div className="grid grid-cols-2 border-t border-white/8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold ${
                    active ? "text-indigo-300" : "text-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminWorkspace({ initialTab = "articles" }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(blankArticle);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [operatingUserId, setOperatingUserId] = useState("");
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      setAccessError("");
      try {
        const sessionRes = await fetch("/api/admin/auth/check");
        const sessionData = await sessionRes.json().catch(() => ({}));
        if (!sessionRes.ok || !sessionData.authenticated) {
          router.replace("/admin/login");
          return;
        }

        setAdmin(sessionData.admin);

        const [usersRes, articlesRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/articles"),
        ]);

        if ([401, 403].includes(usersRes.status) || [401, 403].includes(articlesRes.status)) {
          router.replace("/admin/login");
          return;
        }

        if (!usersRes.ok || !articlesRes.ok) {
          throw new Error("Unable to load admin data");
        }

        const usersData = await usersRes.json();
        const articlesData = await articlesRes.json();
        setUsers(usersData.users || []);
        setArticles(articlesData.articles || []);
      } catch (error) {
        toast.error(error.message || "Unable to load admin panel");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [router]);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((item) => {
      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "active" && !item.isBlocked) ||
        (userStatusFilter === "blocked" && item.isBlocked) ||
        (userStatusFilter === "admin" && item.role === "admin");

      if (!matchesStatus) return false;
      if (!term) return true;

      return [
        item.fullName,
        item.username,
        item.email,
        item.role,
        item.authProvider,
        item.isBlocked ? "blocked" : "active",
        item.blockedReason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [query, userStatusFilter, users]);

  const filteredArticles = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return articles;
    return articles.filter((item) =>
      [item.title, item.slug, item.category, item.status, item.keywords]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [articles, query]);

  const stats = useMemo(() => {
    const published = articles.filter((article) => article.status === "published").length;
    return {
      users: users.length,
      articles: articles.length,
      published,
      drafts: articles.length - published,
    };
  }, [articles, users]);

  const updateForm = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "title" && !current.id ? { slug: slugify(value) } : {}),
    }));
  };

  const updateNested = (type, index, key, value) => {
    setForm((current) => ({
      ...current,
      [type]: current[type].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addNested = (type) => {
    const empty = type === "sources" ? { label: "", url: "" } : { question: "", answer: "" };
    setForm((current) => ({ ...current, [type]: [...current[type], empty] }));
  };

  const removeNested = (type, index) => {
    setForm((current) => ({
      ...current,
      [type]: current[type].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(blankArticle);
    setErrors({});
  };

  const uploadThumbnail = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingThumbnail(true);

    try {
      const res = await fetch("/api/admin/uploads/article-thumbnail", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Unable to upload thumbnail");
      }

      updateForm("thumbnail", data.path);
      toast.success("Thumbnail uploaded");
    } catch (error) {
      toast.error(error.message || "Unable to upload thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const saveArticle = async (status) => {
    setIsSaving(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        status,
        tags: form.tags,
      };
      const endpoint = form.id ? `/api/admin/articles/${form.id}` : "/api/admin/articles";
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(data.errors || {});
        throw new Error(data.error || "Unable to save article");
      }

      setArticles((current) => {
        const exists = current.some((article) => article.id === data.article.id);
        if (exists) {
          return current.map((article) => (article.id === data.article.id ? data.article : article));
        }
        return [data.article, ...current];
      });
      setForm(articleToForm(data.article));
      toast.success(status === "published" ? "Article published" : "Draft saved");
    } catch (error) {
      toast.error(error.message || "Unable to save article");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteArticle = async () => {
    if (!form.id || !window.confirm("Delete this article permanently?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${form.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to delete article");
      setArticles((current) => current.filter((article) => article.id !== form.id));
      resetForm();
      toast.success("Article deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete article");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserBlock = async (targetUser) => {
    const nextBlocked = !targetUser.isBlocked;
    const reason = nextBlocked
      ? window.prompt("Reason for blocking this user?", "Policy violation") || ""
      : "";

    if (
      nextBlocked &&
      !window.confirm(`Block ${targetUser.email}? They will not be able to login.`)
    ) {
      return;
    }

    setOperatingUserId(targetUser.id);
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: nextBlocked, blockedReason: reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to update user");

      setUsers((current) =>
        current.map((item) => (item.id === data.user.id ? data.user : item))
      );
      setSelectedUser((current) => (current?.id === data.user.id ? data.user : current));
      toast.success(nextBlocked ? "User blocked" : "User unblocked");
    } catch (error) {
      toast.error(error.message || "Unable to update user");
    } finally {
      setOperatingUserId("");
    }
  };

  const deleteUser = async (targetUser) => {
    const confirmed = window.confirm(
      `Delete ${targetUser.email} permanently? Their account, notifications, activities, and active group memberships will be removed. Historical expenses will remain for group records.`
    );

    if (!confirmed) return;

    setOperatingUserId(targetUser.id);
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to delete user");

      setUsers((current) => current.filter((item) => item.id !== targetUser.id));
      setSelectedUser((current) => (current?.id === targetUser.id ? null : current));
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete user");
    } finally {
      setOperatingUserId("");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (accessError) {
    return (
      <AdminFrame activeTab={activeTab} admin={admin} onLogout={handleLogout}>
        <div className="max-w-2xl mx-auto mt-10 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6 text-center">
          <Shield className="w-8 h-8 mx-auto text-rose-300 mb-3" />
          <h1 className="text-xl font-bold text-slate-100">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-400">{accessError}</p>
        </div>
      </AdminFrame>
    );
  }

  return (
    <AdminFrame activeTab={activeTab} admin={admin} onLogout={handleLogout}>
      <div className="space-y-5 pb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Shield className="w-4 h-4" />
              Admin workspace
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
              Users and publishing
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage members and publish substantial Money Split articles.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-300">
              {admin?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Admin</p>
              <p className="text-[11px] text-slate-500">{admin?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Users", value: stats.users, icon: Users, tone: "text-sky-300 bg-sky-500/10" },
            { label: "Articles", value: stats.articles, icon: FileText, tone: "text-indigo-300 bg-indigo-500/10" },
            { label: "Published", value: stats.published, icon: CheckCircle2, tone: "text-emerald-300 bg-emerald-500/10" },
            { label: "Drafts", value: stats.drafts, icon: PenLine, tone: "text-amber-300 bg-amber-500/10" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-slate-900 p-4">
                <div className={`w-8 h-8 rounded-lg ${item.tone} flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-slate-100">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full lg:w-auto rounded-xl border border-white/8 bg-slate-900 p-1">
            {[
              { key: "articles", label: "Articles", href: "/admin/articles", icon: FileText },
              { key: "users", label: "Users", href: "/admin/users", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  className={`flex flex-1 lg:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-white/10 text-slate-100" : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            {activeTab === "users" && (
              <select
                value={userStatusFilter}
                onChange={(event) => setUserStatusFilter(event.target.value)}
                className="rounded-xl border border-white/8 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-indigo-400/50"
              >
                <option value="all">All statuses</option>
                <option value="active">Active users</option>
                <option value="blocked">Blocked users</option>
                <option value="admin">Admins</option>
              </select>
            )}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search admin data"
                className="w-full rounded-xl border border-white/8 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
              />
            </div>
          </div>
        </div>

        {activeTab === "users" ? (
          <div className="rounded-2xl border border-white/8 bg-slate-900 overflow-hidden">
            <div className="grid grid-cols-12 gap-3 border-b border-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="col-span-5">User</span>
              <span className="col-span-2 hidden lg:block">Auth</span>
              <span className="col-span-2 hidden md:block">Status</span>
              <span className="col-span-3 text-right">Actions</span>
            </div>
            <div className="divide-y divide-white/6">
              {filteredUsers.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm">
                  <div className="col-span-9 md:col-span-5 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100 truncate">{item.fullName}</p>
                      {item.role === "admin" && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{item.email}</p>
                    {item.isBlocked && item.blockedReason && (
                      <p className="mt-1 line-clamp-1 text-xs text-rose-300">
                        {item.blockedReason}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 hidden lg:flex items-center text-slate-400">
                    {item.authProvider}
                  </div>
                  <div className="col-span-2 hidden md:flex items-center">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.isBlocked ? "bg-rose-500/10 text-rose-300" : "bg-emerald-500/10 text-emerald-300"
                    }`}>
                      {item.isBlocked ? "blocked" : "active"}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/6 px-2.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUserBlock(item)}
                      disabled={operatingUserId === item.id}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        item.isBlocked
                          ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                          : "border border-amber-400/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                      }`}
                    >
                      {operatingUserId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : item.isBlocked ? (
                        <Undo2 className="h-3.5 w-3.5" />
                      ) : (
                        <Ban className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">{item.isBlocked ? "Unblock" : "Block"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(item)}
                      disabled={operatingUserId === item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-500/10 px-2.5 py-2 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/15 disabled:opacity-60"
                    >
                      {operatingUserId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserX className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            <div className="xl:col-span-2 rounded-2xl border border-white/8 bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-4">
                <div>
                  <h2 className="font-bold text-slate-100">Article inventory</h2>
                  <p className="text-xs text-slate-500">Drafts and published posts</p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/12"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              </div>
              <div className="max-h-[760px] divide-y divide-white/6 overflow-y-auto">
                {filteredArticles.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">No articles match your search.</div>
                ) : (
                  filteredArticles.map((article) => {
                    const active = form.id === article.id;
                    return (
                      <div
                        key={article.id}
                        className={`w-full text-left p-4 transition-colors ${
                          active ? "bg-indigo-500/10" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setForm(articleToForm(article));
                            setErrors({});
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold text-slate-100">
                                {article.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">{article.category}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                              article.status === "published"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-amber-500/10 text-amber-300"
                            }`}>
                              {article.status}
                            </span>
                          </div>
                        </button>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(article.date)}
                          </span>
                          {article.status === "published" && (
                            <Link
                              href={`/articles/${article.slug}`}
                              className="text-indigo-300 hover:text-indigo-200"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="xl:col-span-3 rounded-2xl border border-white/8 bg-slate-900 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-white/8 pb-4 mb-5">
                <div>
                  <h2 className="font-bold text-slate-100">
                    {form.id ? "Edit article" : "Create article"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Use original, useful guidance with clear author and review context.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.id && (
                    <button
                      type="button"
                      onClick={deleteArticle}
                      disabled={isDeleting || isSaving}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/15 disabled:opacity-60"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => saveArticle("draft")}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save draft
                  </button>
                  <button
                    type="button"
                    onClick={() => saveArticle("published")}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Publish
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="md:col-span-2">
                  <span className="text-xs font-semibold text-slate-400">Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    placeholder="Example: How to split rent with roommates fairly"
                  />
                  <FieldError errors={errors} name="title" />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">Slug</span>
                  <input
                    value={form.slug}
                    onChange={(event) => updateForm("slug", slugify(event.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                  />
                  <FieldError errors={errors} name="slug" />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">Category</span>
                  <input
                    value={form.category}
                    onChange={(event) => updateForm("category", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="text-xs font-semibold text-slate-400">Excerpt</span>
                  <textarea
                    value={form.excerpt}
                    onChange={(event) => updateForm("excerpt", event.target.value)}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    placeholder="Summarize the article with a helpful promise for readers."
                  />
                  <FieldError errors={errors} name="excerpt" />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">Tags</span>
                  <input
                    value={form.tags}
                    onChange={(event) => updateForm("tags", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    placeholder="roommates, rent, shared bills"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">Keywords</span>
                  <input
                    value={form.keywords}
                    onChange={(event) => updateForm("keywords", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    placeholder="split rent, roommate expenses"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">Author</span>
                  <input
                    value={form.authorName}
                    onChange={(event) => updateForm("authorName", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">Reviewer</span>
                  <input
                    value={form.reviewerName}
                    onChange={(event) => updateForm("reviewerName", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    placeholder="Optional"
                  />
                </label>
                <div className="md:col-span-2">
                  <span className="text-xs font-semibold text-slate-400">Thumbnail</span>
                  <div className="mt-1 grid grid-cols-1 gap-3 rounded-xl border border-white/8 bg-slate-950 p-3 sm:grid-cols-[180px_1fr]">
                    <div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/8 bg-slate-900">
                      {form.thumbnail ? (
                        <img
                          src={form.thumbnail}
                          alt="Article thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-600">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">
                        {isUploadingThumbnail ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload thumbnail
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          disabled={isUploadingThumbnail}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            uploadThumbnail(file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <input
                        value={form.thumbnail}
                        onChange={(event) => updateForm("thumbnail", event.target.value)}
                        className="w-full rounded-lg border border-white/8 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                        placeholder="/uploads/articles/example.webp"
                      />
                      <p className="text-xs leading-5 text-slate-500">
                        Uploaded files are saved in <span className="font-mono text-slate-400">public/uploads/articles</span> and can be used immediately after saving or publishing the article.
                      </p>
                    </div>
                  </div>
                </div>
                <label>
                  <span className="text-xs font-semibold text-slate-400">SEO title</span>
                  <input
                    value={form.seoTitle}
                    onChange={(event) => updateForm("seoTitle", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    maxLength={70}
                  />
                  <FieldError errors={errors} name="seoTitle" />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-400">SEO description</span>
                  <input
                    value={form.seoDescription}
                    onChange={(event) => updateForm("seoDescription", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                    maxLength={170}
                  />
                  <FieldError errors={errors} name="seoDescription" />
                </label>
                <label className="md:col-span-2">
                  <span className="text-xs font-semibold text-slate-400">Article content</span>
                  <textarea
                    value={form.content}
                    onChange={(event) => updateForm("content", event.target.value)}
                    rows={16}
                    className="mt-1 w-full resize-y rounded-xl border border-white/8 bg-slate-950 px-3 py-2.5 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-indigo-400/50"
                    placeholder={"Use markdown headings, paragraphs, and lists. Include practical examples, original advice, and clear takeaways."}
                  />
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{form.content.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <FieldError errors={errors} name="content" />
                  </div>
                </label>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/8 bg-slate-950 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-100">Sources</h3>
                    <button type="button" onClick={() => addNested("sources")} className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
                      Add source
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.sources.map((source, index) => (
                      <div key={index} className="grid grid-cols-1 gap-2">
                        <input
                          value={source.label}
                          onChange={(event) => updateNested("sources", index, "label", event.target.value)}
                          placeholder="Source label"
                          className="rounded-lg border border-white/8 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                        />
                        <div className="flex gap-2">
                          <input
                            value={source.url}
                            onChange={(event) => updateNested("sources", index, "url", event.target.value)}
                            placeholder="https://..."
                            className="min-w-0 flex-1 rounded-lg border border-white/8 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                          />
                          <button type="button" onClick={() => removeNested("sources", index)} className="rounded-lg px-2 text-slate-500 hover:text-rose-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/8 bg-slate-950 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-100">FAQs</h3>
                    <button type="button" onClick={() => addNested("faqs")} className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
                      Add FAQ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.faqs.map((faq, index) => (
                      <div key={index} className="grid grid-cols-1 gap-2">
                        <input
                          value={faq.question}
                          onChange={(event) => updateNested("faqs", index, "question", event.target.value)}
                          placeholder="Question"
                          className="rounded-lg border border-white/8 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                        />
                        <div className="flex gap-2">
                          <textarea
                            value={faq.answer}
                            onChange={(event) => updateNested("faqs", index, "answer", event.target.value)}
                            placeholder="Answer"
                            rows={2}
                            className="min-w-0 flex-1 resize-none rounded-lg border border-white/8 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
                          />
                          <button type="button" onClick={() => removeNested("faqs", index)} className="rounded-lg px-2 text-slate-500 hover:text-rose-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 w-4 h-4 text-emerald-300" />
                  <div className="text-xs leading-5 text-slate-400">
                    <p className="font-semibold text-slate-200">Publishing checklist</p>
                    <p>Use original examples, clear headings, substantial body content, author context, useful FAQs, and relevant source links where needed. Avoid copied or filler text.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleBlock={toggleUserBlock}
        onDelete={deleteUser}
        busy={Boolean(operatingUserId)}
      />
    </AdminFrame>
  );
}
