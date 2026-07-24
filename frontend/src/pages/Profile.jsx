import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/Loader";

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, bio: user?.bio || "" },
  });
  const [saving, setSaving] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => (await api.get("/auth/sessions")).data.sessions,
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", data);
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-xs text-slate-400">Level {user?.level} · {user?.xp} XP · {user?.streak} day streak</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Name</label>
          <input className="input" {...register("name")} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Bio</label>
          <textarea className="input" rows={3} {...register("bio")} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="card p-6">
        <h3 className="font-semibold mb-3">Device login history</h3>
        {isLoading ? (
          <Loader label="Loading sessions..." />
        ) : (
          <div className="space-y-2">
            {sessions?.slice().reverse().map((s, i) => (
              <div key={i} className="text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="truncate max-w-xs">{s.userAgent || "Unknown device"}</span>
                <span className="text-slate-400 text-xs">{new Date(s.loggedInAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
