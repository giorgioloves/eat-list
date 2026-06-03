'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-espresso-300 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2.5 text-sm text-espresso-50 placeholder-espresso-400
              focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-espresso-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2.5 text-sm text-espresso-50 placeholder-espresso-400
              focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed
            text-espresso-900 font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-espresso-700" />
        </div>
        <div className="relative flex justify-center text-xs text-espresso-400">
          <span className="bg-espresso-900 px-2">or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 bg-espresso-800 hover:bg-espresso-700 border border-espresso-600
          disabled:opacity-60 disabled:cursor-not-allowed text-espresso-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        <Chrome className="w-4 h-4" />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <p className="text-center text-sm text-espresso-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-gold-500 hover:text-gold-400 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  )
}
