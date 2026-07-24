import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, data);
      toast.success("Password reset! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-dark px-4">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-semibold mb-1">Reset password</h2>
        <p className="text-sm text-slate-400 mb-6">Choose a new password.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="password"
            className="input"
            placeholder="New password"
            {...register("password", { required: true, minLength: 6 })}
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          <Link to="/login" className="text-primary font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
