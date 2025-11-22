"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth-schemas";
import { AlertCircle, Loader2, Mail, CheckCircle, ArrowLeft, KeyRound, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ForgotPasswordForm({ onSuccess, className = "" }: ForgotPasswordFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el email");
      }

      setSuccess(true);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error en forgot password:", error);
      setError(error instanceof Error ? error.message : "Algo salió mal. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues("email");
    if (!email) return;

    setIsLoading(true);
    try {
      await onSubmit({ email });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          p-8 md:p-10 text-center
          before:absolute before:inset-0 before:bg-gradient-to-br
          before:from-crystal-100/20 before:to-crystal-200/10 before:rounded-2xl
        ">
          {/* Success Icon */}
          <motion.div
            className="text-center mb-8 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.div
              className="
                w-16 h-16 mx-auto mb-6
                bg-gradient-to-br from-green-500 to-green-600
                rounded-2xl flex items-center justify-center
                shadow-lg
                before:absolute before:inset-0 before:rounded-2xl
                before:bg-gradient-to-r before:from-green-400 before:to-green-500
                before:opacity-20 before:blur-sm
              "
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            >
              <CheckCircle className="h-8 w-8 text-white relative z-10" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
              Email Enviado
            </h2>
            <p className="text-gray-600 font-medium">
              Revisa tu bandeja de entrada y spam
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="space-y-6 mb-8 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-gray-600">
              Te hemos enviado un enlace para restablecer tu contraseña a{" "}
              <strong className="text-gray-900">{getValues("email")}</strong>
            </p>

            <div className="bg-liquid-50/50 backdrop-blur-sm border border-liquid-200/40 rounded-xl p-4">
              <h3 className="font-semibold text-liquid-900 mb-3">
                ¿No ves el email?
              </h3>
              <ul className="text-sm text-liquid-800 space-y-2">
                <li className="flex items-start">
                  <span className="text-liquid-500 mr-2">•</span>
                  Revisa tu carpeta de spam o correo no deseado
                </li>
                <li className="flex items-start">
                  <span className="text-liquid-500 mr-2">•</span>
                  El email puede tardar unos minutos en llegar
                </li>
                <li className="flex items-start">
                  <span className="text-liquid-500 mr-2">•</span>
                  Asegúrate de que el email esté escrito correctamente
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="space-y-4 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button
              onClick={handleResendEmail}
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
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-3" />
                  Reenviar email
                </>
              )}
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/login"
                className="
                  w-full flex justify-center items-center py-4 px-6
                  bg-gradient-to-r from-liquid-600 to-liquid-700
                  text-white font-semibold rounded-xl
                  hover:from-liquid-700 hover:to-liquid-800
                  transition-all duration-200 transform hover:scale-[1.02]
                  shadow-liquid-lg
                "
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

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
            bg-gradient-to-br from-accent-500 via-accent-600 to-liquid-500
            rounded-2xl flex items-center justify-center
            shadow-accent-lg
            before:absolute before:inset-0 before:rounded-2xl
            before:bg-gradient-to-r before:from-crystal-pink before:to-crystal-violet
            before:opacity-20 before:blur-sm
          ">
            <KeyRound className="h-8 w-8 text-white relative z-10" />
            <Sparkles className="absolute top-2 right-2 h-4 w-4 text-crystal-200 opacity-60" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            ¿Olvidaste tu Contraseña?
          </h2>
          <p className="text-gray-600 font-medium">
            No te preocupes, te enviaremos un enlace de recuperación
          </p>
        </motion.div>

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
              Email de Recuperación
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-hover:text-accent-500 transition-colors duration-200" />
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
                  focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500
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

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="
              relative w-full flex justify-center items-center py-4 px-6
              bg-gradient-to-r from-accent-600 via-accent-500 to-liquid-500
              hover:from-accent-700 hover:via-accent-600 hover:to-liquid-600
              text-white font-semibold rounded-xl shadow-accent-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              transform transition-all duration-300 hover:scale-[1.02] hover:shadow-accent-xl
              before:absolute before:inset-0 before:rounded-xl
              before:bg-gradient-to-r before:from-crystal-pink before:to-crystal-violet
              before:opacity-0 hover:before:opacity-20 before:transition-opacity before:duration-300
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="relative z-10">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                "Enviar Enlace de Recuperación"
              )}
            </span>
          </motion.button>
        </form>

        {/* Back to Login */}
        <motion.div
          className="mt-8 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-accent-700 font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al Login
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}