import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline'
import { useSession } from '../../context/SessionContext'
import { Button, Card, CardContent } from '../ui'
import { generateAnonymousUsername, isValidUsername } from '../../lib/identity'

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useSession()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const generateUsername = () => {
    const username = generateAnonymousUsername()
    setFormData(prev => ({ ...prev, username }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!isValidUsername(formData.username)) {
      setError('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      })
      
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
          <h1 className="text-4xl font-bold font-display mb-2">Create Account</h1>
          <p className="text-base-content/60">Join Haven for secure, anonymous messaging</p>
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
                  <span className="label-text">Username</span>
                  <button
                    type="button"
                    className="label-text-alt link link-primary"
                    onClick={generateUsername}
                  >
                    Generate random
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    placeholder="SecureUser123"
                    className="input input-bordered w-full pl-10"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={handleChange}
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
                    name="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full pr-10"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="input input-bordered w-full pr-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="divider">or</div>

            <div className="text-center">
              <span className="text-base-content/60">Already have an account? </span>
              <Link to="/auth/sign-in" className="link link-primary">
                Sign in
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
            <span>Anonymous by design • No phone number required</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp