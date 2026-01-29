import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useSession } from '../../context/SessionContext'
import { Button, Card, CardContent } from '../ui'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useSession()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn({ email, password })
      if (error) {
        setError(error.message)
      } else {
        navigate('/protected')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-display mb-2">Welcome Back</h1>
          <p className="text-base-content/60">Sign in to your secure Haven account</p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input input-bordered w-full pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-base-content/40" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="divider">or</div>

            <div className="text-center">
              <span className="text-base-content/60">Don't have an account? </span>
              <Link to="/auth/sign-up" className="link link-primary">
                Sign up
              </Link>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="link link-neutral text-sm">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-sm text-base-content/40">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Your messages are end-to-end encrypted</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignIn