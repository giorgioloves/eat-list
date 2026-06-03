'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // If email confirmation is disabled in Supabase, redirect directly
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-espresso-50 font-medium">Account created!</p>
        <p className="text-espresso-300 text-sm">
          Check your email to confirm your account, or wait a moment to be redirected.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-espresso-300 mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2.5 text-sm text-espresso-50 placeholder-espresso-400
              focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
        </div>
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
            placeholder="Min. 8 characters"
            required
            minLength={8}
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-espresso-400">
        Already have an account?{' '}
        <Link href="/login" className="text-gold-500 hover:text-gold-400 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
