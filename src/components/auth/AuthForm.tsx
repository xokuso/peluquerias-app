"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, User, UserCheck, Chrome } from 'lucide-react';

// Simplified schemas for the offer page
const loginSchema = z.object({
  email: z.string().email('Por favor introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor introduce un email válido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
  role: z.enum(['CLIENT', 'ADMIN']).refine((val) => val === 'CLIENT' || val === 'ADMIN', {
    message: 'Selecciona un rol válido'
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
  onSuccess?: () => void;
  className?: string;
}

export default function AuthForm({ onSuccess, className = "" }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'CLIENT',
    },
  });

  const currentForm = mode === 'login' ? loginForm : signupForm;

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
        return;
      }

      if (result?.ok) {
        setSuccess('¡Sesión iniciada correctamente!');

        // Simulate getting user role for redirect (in real app, get from session)
        // For demo, assume CLIENT role redirects to /client, ADMIN to /admin
        const redirectTo = '/client'; // This would be determined by the user's actual role

        setTimeout(() => {
          router.push(redirectTo);
          onSuccess?.();
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setError(null);
    setSuccess(null);

    try {
      // Create simplified user data for the offer page
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        salonName: `${data.name}'s Salon`, // Default salon name
        phone: '+34600000000', // Default phone
        city: 'Madrid', // Default city
        businessType: 'SALON', // Default business type
        acceptTerms: true, // Auto-accept for offer page
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la cuenta');
      }

      setSuccess('¡Cuenta creada exitosamente!');

      // Auto-login after successful signup
      setTimeout(async () => {
        const loginResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (loginResult?.ok) {
          const redirectTo = data.role === 'ADMIN' ? '/admin' : '/client';
          router.push(redirectTo);
          onSuccess?.();
        }
      }, 1000);

    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la cuenta. Inténtalo de nuevo.');
    }
  };

  const handleSubmit = (data: LoginFormData | SignupFormData) => {
    startTransition(() => {
      if (mode === 'login') {
        handleLogin(data as LoginFormData);
      } else {
        handleSignup(data as SignupFormData);
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: '/client',
        redirect: true
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Error al iniciar sesión con Google');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-200/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {mode === 'login' ? (
              <Lock className="w-8 h-8 text-white" />
            ) : (
              <UserCheck className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-slate-600">
            {mode === 'login'
              ? 'Accede a tu panel de control'
              : 'Únete a nuestra plataforma'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={currentForm.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name field (signup only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...signupForm.register('name')}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Tu nombre completo"
                  disabled={isPending}
                />
              </div>
              {signupForm.formState.errors.name && (
                <p className="text-red-600 text-xs mt-1">{signupForm.formState.errors.name.message}</p>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
{...(mode === 'login' ? loginForm.register('email') : signupForm.register('email'))}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="tu@email.com"
                disabled={isPending}
              />
            </div>
{(mode === 'login' ? loginForm.formState.errors.email : signupForm.formState.errors.email) && (
              <p className="text-red-600 text-xs mt-1">
                {(mode === 'login' ? loginForm.formState.errors.email?.message : signupForm.formState.errors.email?.message)}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
{...(mode === 'login' ? loginForm.register('password') : signupForm.register('password'))}
                className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="••••••••"
                disabled={isPending}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                )}
              </button>
            </div>
{(mode === 'login' ? loginForm.formState.errors.password : signupForm.formState.errors.password) && (
              <p className="text-red-600 text-xs mt-1">
                {(mode === 'login' ? loginForm.formState.errors.password?.message : signupForm.formState.errors.password?.message)}
              </p>
            )}
          </div>

          {/* Role selection (signup only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                Tipo de cuenta
              </label>
              <select
                id="role"
                {...signupForm.register('role')}
                className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                disabled={isPending}
              >
                <option value="CLIENT">Cliente / Propietario</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {signupForm.formState.errors.role && (
                <p className="text-red-600 text-xs mt-1">{signupForm.formState.errors.role.message}</p>
              )}
            </div>
          )}

          {/* Remember me (login only) */}
          {mode === 'login' && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...loginForm.register('rememberMe')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                disabled={isPending}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700">
                Recordarme
              </label>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">o continúa con</span>
            </div>
          </div>
        </div>

        {/* Google sign in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Chrome className="w-5 h-5 mr-2" />
          Iniciar sesión con Google
        </button>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              disabled={isPending}
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}