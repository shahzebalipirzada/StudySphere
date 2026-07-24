import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", data);
      setSent(res.data.devResetToken || true);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-dark px-4">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-semibold mb-1">Forgot password</h2>
        <p className="text-sm text-slate-400 mb-6">We'll help you reset it.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="email" className="input" placeholder="you@example.com" {...register("email", { required: true })} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        {sent && typeof sent === "string" && (
          <div className="mt-4 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl p-3 break-all">
            Dev mode token (no email provider configured):{" "}
            <Link to={`/reset-password/${sent}`} className="text-primary font-medium">
              Reset now
            </Link>
          </div>
        )}
        <p className="text-center text-sm text-slate-400 mt-6">
          <Link to="/login" className="text-primary font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
