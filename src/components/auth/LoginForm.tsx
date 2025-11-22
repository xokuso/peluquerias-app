"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/auth-schemas";
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, Sparkles, ShieldCheck, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className = "" }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionVerification, setSessionVerification] = useState<{
    sessionId: string | null;
    autoVerify: boolean;
    verificationStatus: 'checking' | 'verified' | 'not_found' | null;
  }>({ sessionId: null, autoVerify: false, verificationStatus: null });

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/client";

  // Check for session verification parameters
  const sessionId = searchParams.get("session_id");
  const autoVerify = searchParams.get("auto_verify") === "true";

  // Auto-verify session on component mount if parameters are present
  useEffect(() => {
    if (sessionId && autoVerify) {
      setSessionVerification({
        sessionId,
        autoVerify: true,
        verificationStatus: 'checking'
      });
      verifyStripeSession(sessionId);
    }
  }, [sessionId, autoVerify]);

  const verifyStripeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setSessionVerification(prev => ({
          ...prev,
          verificationStatus: 'verified'
        }));
        // Pre-fill email if available
        if (data.email) {
          setValue('email', data.email);
        }
      } else {
        setSessionVerification(prev => ({
          ...prev,
          verificationStatus: 'not_found'
        }));
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setSessionVerification(prev => ({
        ...prev,
        verificationStatus: 'not_found'
      }));
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas. Por favor verifica tu email y contraseña.");
      } else {
        // Get updated session to check user role
        const session = await getSession();
        onSuccess?.();

        // Role-based redirect logic
        if (session?.user) {
          const redirectUrl = getRedirectByRole(session.user.role, session.user.hasCompletedOnboarding);
          router.push(redirectUrl);
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Algo salió mal. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectByRole = (role: string, hasCompletedOnboarding: boolean) => {
    // If user hasn't completed onboarding, redirect to setup
    if (!hasCompletedOnboarding) {
      return "/client/setup";
    }

    // Role-based redirects
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "OWNER":
        return "/client";
      case "STAFF":
        return "/client";
      case "USER":
      default:
        return "/client";
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Error con Google:", error);
      setError("Error al iniciar sesión con Google");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`w-full max-w-md mx-auto ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="
        relative overflow-hidden
        bg-crystal-50/90 backdrop-blur-xl border border-crystal-200/50
        rounded-2xl shadow-glass-lg
        p-8 md:p-10
        before:absolute before:inset-0 before:bg-gradient-to-br
        before:from-crystal-100/20 before:to-crystal-200/10 before:rounded-2xl
      ">
        {/* Header */}
        <motion.div
          className="text-center mb-8 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="
            relative w-16 h-16 mx-auto mb-6
            bg-gradient-to-br from-liquid-500 via-liquid-600 to-accent-500
            rounded-2xl flex items-center justify-center
            shadow-liquid-lg
            before:absolute before:inset-0 before:rounded-2xl
            before:bg-gradient-to-r before:from-crystal-azure before:to-crystal-violet
            before:opacity-20 before:blur-sm
          ">
            <ShieldCheck className="h-8 w-8 text-white relative z-10" />
            <Sparkles className="absolute top-2 right-2 h-4 w-4 text-crystal-200 opacity-60" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Bienvenido de Vuelta
          </h2>
          <p className="text-gray-600 font-medium">
            Accede a tu panel profesional de gestión
          </p>
        </motion.div>

        {/* Session Verification Status */}
        {sessionVerification.autoVerify && (
          <motion.div
            className={`mb-6 p-4 backdrop-blur-sm border rounded-xl flex items-start space-x-3 shadow-sm relative z-10 ${
              sessionVerification.verificationStatus === 'verified'
                ? 'bg-green-50/80 border-green-200/60'
                : sessionVerification.verificationStatus === 'checking'
                ? 'bg-blue-50/80 border-blue-200/60'
                : 'bg-orange-50/80 border-orange-200/60'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {sessionVerification.verificationStatus === 'verified' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm font-medium">Tu pago fue procesado exitosamente</p>
                  <p className="text-green-600 text-xs mt-1">
                    Tu cuenta está creada. Ingresa tu contraseña para acceder.
                  </p>
                </div>
              </>
            )}
            {sessionVerification.verificationStatus === 'checking' && (
              <>
                <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="text-blue-700 text-sm font-medium">Verificando tu pago...</p>
                  <p className="text-blue-600 text-xs mt-1">Un momento por favor</p>
                </div>
              </>
            )}
            {sessionVerification.verificationStatus === 'not_found' && (
              <>
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-700 text-sm font-medium">Sesión no encontrada</p>
                  <p className="text-orange-600 text-xs mt-1">
                    Si realizaste un pago, contacta con soporte.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl flex items-start space-x-3 shadow-sm relative z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-hover:text-liquid-500 transition-colors duration-200" />
              </div>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`
                  block w-full pl-12 pr-4 py-4
                  bg-crystal-100/50 backdrop-blur-sm
                  border border-crystal-300/50 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-liquid-500/50 focus:border-liquid-500
                  hover:border-crystal-400/60
                  disabled:bg-crystal-200/30 disabled:text-gray-500
                  transition-all duration-200 ease-out
                  text-gray-900 placeholder-gray-500
                  shadow-sm hover:shadow-md
                  ${errors.email
                    ? 'border-red-300/60 bg-red-50/30 focus:ring-red-500/50 focus:border-red-500'
                    : ''
                  }
                `}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <motion.p
                className="mt-2 text-sm text-red-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-hover:text-liquid-500 transition-colors duration-200" />
              </div>
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading}
                className={`
                  block w-full pl-12 pr-12 py-4
                  bg-crystal-100/50 backdrop-blur-sm
                  border border-crystal-300/50 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-liquid-500/50 focus:border-liquid-500
                  hover:border-crystal-400/60
                  disabled:bg-crystal-200/30 disabled:text-gray-500
                  transition-all duration-200 ease-out
                  text-gray-900 placeholder-gray-500
                  shadow-sm hover:shadow-md
                  ${errors.password
                    ? 'border-red-300/60 bg-red-50/30 focus:ring-red-500/50 focus:border-red-500'
                    : ''
                  }
                `}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-liquid-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                className="mt-2 text-sm text-red-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          {/* Forgot Password Link */}
          <motion.div
            className="flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              href="/forgot-password"
              className="text-sm text-liquid-600 hover:text-liquid-700 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="
              relative w-full flex justify-center items-center py-4 px-6
              bg-gradient-to-r from-liquid-600 via-liquid-500 to-accent-500
              hover:from-liquid-700 hover:via-liquid-600 hover:to-accent-600
              text-white font-semibold rounded-xl shadow-liquid-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liquid-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              transform transition-all duration-300 hover:scale-[1.02] hover:shadow-liquid-xl
              before:absolute before:inset-0 before:rounded-xl
              before:bg-gradient-to-r before:from-crystal-azure before:to-crystal-violet
              before:opacity-0 hover:before:opacity-20 before:transition-opacity before:duration-300
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="relative z-10">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </span>
          </motion.button>

          {/* Divider */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-crystal-300/60" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-crystal-50/90 text-gray-500 font-medium backdrop-blur-sm rounded-lg">
                o continúa con
              </span>
            </div>
          </motion.div>

          {/* Google Sign In */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="
              w-full flex justify-center items-center py-4 px-6
              bg-crystal-100/50 backdrop-blur-sm border border-crystal-300/50 rounded-xl
              text-gray-700 font-semibold shadow-sm
              hover:bg-crystal-200/50 hover:border-crystal-400/60 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liquid-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              transform transition-all duration-200 hover:scale-[1.02]
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <motion.div
          className="mt-8 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/signup"
              className="font-semibold text-liquid-600 hover:text-liquid-700 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Regístrate aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}