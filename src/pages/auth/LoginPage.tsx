import { useState } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@kubogent.ai' && password === 'Aivar@123') {
      sessionStorage.setItem('kubogent_auth', 'true')
      onLogin()
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-purple" />
          </div>
          <span className="text-2xl font-semibold text-text-primary">Kubogent</span>
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Sign in</h2>
          <p className="text-sm text-text-secondary mb-6">Access your AI infrastructure platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="admin@kubogent.ai"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-accent-red">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-xs text-text-muted text-center mt-6">Kubogent AI - Enterprise AI Infrastructure</p>
      </div>
    </div>
  )
}
