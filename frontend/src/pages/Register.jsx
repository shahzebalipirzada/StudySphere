import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { GraduationCap } from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import logo from "../assets/sqr-logo.png";

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      login(res.data.user, res.data.accessToken);
      toast.success("Account created! Welcome to StudySphere.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-dark px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md card p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <img src={logo} alt="" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">StudySphere</h1>
            <p className="text-xs text-slate-400">AI Student OS</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-1">Create your account</h2>
        <p className="text-sm text-slate-400 mb-6">Start learning smarter, today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full name</label>
            <input className="input" placeholder="Jane Doe" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              type="password"
              className="input"
              placeholder="At least 6 characters"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
            />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Confirm password</label>
            <input
              type="password"
              className="input"
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === watch("password") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
