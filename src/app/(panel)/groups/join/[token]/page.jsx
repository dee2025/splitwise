"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function JoinGroupPage() {
  const { token } = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`/api/groups/invites/${token}`);
        const nextInvite = res.data.invite;

        if (nextInvite?.alreadyMember && nextInvite?.groupId) {
          router.replace(`/groups/${nextInvite.groupId}`);
          return;
        }

        setInvite(nextInvite);
      } catch (err) {
        if (err.response?.status === 401) {
          router.replace(`/login?redirect=${encodeURIComponent(`/groups/join/${token}`)}`);
          return;
        }

        setError(err.response?.data?.error || "Invite link is invalid or expired");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInvite();
    }
  }, [router, token]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await axios.post(`/api/groups/invites/${token}/join`);
      toast.success(res.data.message || "Joined group");
      router.replace(`/groups/${res.data.groupId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        router.replace(`/login?redirect=${encodeURIComponent(`/groups/join/${token}`)}`);
        return;
      }

      toast.error(err.response?.data?.error || "Unable to join group");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-2xl border border-white/8 bg-slate-800 p-6 shadow-2xl shadow-black/40"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400">Checking invite link...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-100">Invite unavailable</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">{error}</p>
              <Link
                href="/groups"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Back to groups
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Group invite</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-100">{invite?.name}</h1>
              {invite?.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-400">{invite.description}</p>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                {invite?.memberCount || 0} member{invite?.memberCount === 1 ? "" : "s"} already in this group
              </p>

              <button
                type="button"
                onClick={handleJoin}
                disabled={joining}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {joining ? "Joining..." : "Join group"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
