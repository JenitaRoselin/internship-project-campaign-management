"use client";
import { useActionState, useEffect } from 'react'; // Updated hook name
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ArrowLeft } from 'lucide-react';
import { authenticate } from './actions';


export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(authenticate, null);


useEffect(() => {
  if (state?.success && state.tenantId) {
    // This sends them to /dashboard?id=550e84...
    router.push(`/dashboard?id=${state.tenantId}`);
  }
}, [state, router]);

  // Specific error checks
  const isUserError = state?.error === 'invalid_user';
  const isPassError = state?.error === 'invalid_password';

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <form action={formAction} className="space-y-5 border-2 border-gray-100 p-10 rounded-[2.5rem] shadow-xl bg-white">
          <h2 className="text-3xl font-bold text-[#4B0082] text-center mb-8">Login</h2>
          
          <div>
            <label className="block text-sm font-semibold mb-2 ml-1">Tenant Name</label>
            <input 
              name="username"
              className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all 
                ${isUserError ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-[#5D00B1]'}`}
            />
            {isUserError && <p className="text-red-500 text-xs mt-1 ml-1">Tenant name not found.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 ml-1">Tenant ID (UUID)</label>
            <input 
              name="password"
              type="password"
              className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all 
                ${isPassError ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-[#5D00B1]'}`}
            />
            {isPassError && <p className="text-red-500 text-xs mt-1 ml-1">Incorrect Tenant ID.</p>}
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#5D00B1] text-white py-4 rounded-2xl text-xl font-semibold hover:bg-[#4B0082] transition-all shadow-lg mt-4 disabled:bg-gray-400"
          >
            {isPending ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
