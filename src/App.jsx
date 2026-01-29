import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createAccount, signIn, signOut, getSession, recoverByKey, resetPasswordWithRecovery } from './lib/auth'
import { searchAccounts, getContacts, addContact, removeContact } from './lib/contacts'
import {
  getNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  unreadCount,
} from './lib/notifications'
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  clearChat,
  deleteChat,
  getChatSettings,
  updateChatSettings,
} from './lib/messages'
import {
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
  PaperClipIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  InformationCircleIcon,
  NoSymbolIcon,
  BellSlashIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
  TrashIcon,
  MinusCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import AnimatedCloudBackground from './components/AnimatedCloudBackground'

function HomePage() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    setSession(getSession())
  }, [])

  const handleSignOut = () => {
    signOut()
    setSession(null)
  }

  return (
    <AnimatedCloudBackground>
      <div className="container mx-auto px-4 py-16 text-white min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#E0E1DD]">Haven</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link to="/dashboard" className="text-[#778DA9] hover:text-[#E0E1DD] transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="text-[#778DA9] hover:text-[#E0E1DD] transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/sign-in" className="text-[#778DA9] hover:text-[#E0E1DD] transition-colors">
                  Sign In
                </Link>
                <Link to="/sign-up" className="bg-gradient-to-r from-[#415A77] to-[#778DA9] hover:from-[#778DA9] hover:to-[#A3B1C6] text-white font-semibold py-2 px-4 rounded-lg transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex-1 flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-[#E0E1DD]">Private</span>{" "}
            <span className="bg-gradient-to-r from-[#778DA9] to-[#E0E1DD] bg-clip-text text-transparent">
              Communication
            </span>
            <br />
            <span className="text-[#E0E1DD]">For Everyone</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#778DA9] max-w-2xl mx-auto mb-10">
            Haven is a sanctuary for secure messaging. End-to-end encrypted, anonymous, 
            and built for those who value their privacy.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {session ? (
              <>
                <Link to="/dashboard" className="bg-gradient-to-r from-[#415A77] to-[#778DA9] hover:from-[#778DA9] hover:to-[#A3B1C6] text-white font-semibold py-4 px-8 rounded-lg transition-all text-lg shadow-lg shadow-[#415A77]/30">
                  Go to Dashboard
                </Link>
                <button onClick={handleSignOut} className="border border-[#415A77] hover:bg-[#415A77]/20 text-[#E0E1DD] font-semibold py-4 px-8 rounded-lg transition-colors text-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/sign-up" className="bg-gradient-to-r from-[#415A77] to-[#778DA9] hover:from-[#778DA9] hover:to-[#A3B1C6] text-white font-semibold py-4 px-8 rounded-lg transition-all text-lg shadow-lg shadow-[#415A77]/30">
                  Get Started Free
                </Link>
                <Link to="/sign-in" className="border border-[#415A77] hover:bg-[#415A77]/20 text-[#E0E1DD] font-semibold py-4 px-8 rounded-lg transition-colors text-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 mt-10 text-[#778DA9] text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
              <span>No email required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
              <span>100% encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
              <span>Open source</span>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 pb-16">
          <div className="text-center p-6 bg-[#1B263B]/50 backdrop-blur-sm rounded-xl border border-[#415A77]/30">
            <div className="w-16 h-16 bg-gradient-to-br from-[#415A77] to-[#778DA9] rounded-xl flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#E0E1DD]">End-to-End Encrypted</h3>
            <p className="text-[#778DA9]">
              Your messages are encrypted before they leave your device. 
              Only you and your recipient can read them.
            </p>
          </div>

          <div className="text-center p-6 bg-[#1B263B]/50 backdrop-blur-sm rounded-xl border border-[#415A77]/30">
            <div className="w-16 h-16 bg-gradient-to-br from-[#415A77] to-[#778DA9] rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#E0E1DD]">Anonymous by Design</h3>
            <p className="text-[#778DA9]">
              No phone number or email required. Create an account with just a 
              username and password.
            </p>
          </div>

          <div className="text-center p-6 bg-[#1B263B]/50 backdrop-blur-sm rounded-xl border border-[#415A77]/30">
            <div className="w-16 h-16 bg-gradient-to-br from-[#415A77] to-[#778DA9] rounded-xl flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#E0E1DD]">Disappearing Messages</h3>
            <p className="text-[#778DA9]">
              Set messages to automatically delete after 2 days by default. Leave no trace of 
              your conversations.
            </p>
          </div>
        </div>
      </div>
    </AnimatedCloudBackground>
  )
}

function SignInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justRegistered = searchParams.get('registered') === '1'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn(username, password)
      if (result.success) navigate('/dashboard')
      else setError(result.error || 'Username or password may be incorrect')
    } catch (_) {
      setError('Username or password may be incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your Haven account</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {justRegistered && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-3 py-2 rounded-md text-sm">
                Account created. Sign in with your username and password.
              </div>
            )}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="SecureUser123"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="••••••••"
                required
              />
            </div>

            <Link to="/recover" className="block text-sm text-blue-400 hover:text-blue-300 mb-2">
              Forgot password or username?
            </Link>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </p>
            <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm mt-2 block">
              ← Back to home
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span>🔒</span>
            <span>Your messages are end-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignUpPage() {
  const navigate = useNavigate()
  const [currentPhase, setCurrentPhase] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [recoveryKey, setRecoveryKey] = useState('')

  // Generate random username suggestions
  const generateUsernames = () => {
    const adjectives = ['Silent', 'Shadow', 'Cipher', 'Ghost', 'Secure', 'Hidden', 'Swift', 'Phantom', 'Mystic', 'Stealth']
    const nouns = ['Wolf', 'Eagle', 'Raven', 'Fox', 'Tiger', 'Lion', 'Bear', 'Hawk', 'Falcon', 'Shark']
    const suffixes = ['X', 'Zero', 'Prime', 'Nova', 'Alpha', 'Beta', 'Delta', 'Echo']
    
    return Array.from({ length: 3 }, () => {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
      const noun = nouns[Math.floor(Math.random() * nouns.length)]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      const number = Math.floor(Math.random() * 999) + 1
      return `${adj}${noun}${suffix}${number}`
    })
  }

  const [usernameSuggestions] = useState(generateUsernames())

  // Pure helper – no setState. Safe to call during render.
  const getPasswordValidation = (password) => {
    return {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  }

  const isPasswordValid = (password) => Object.values(getPasswordValidation(password)).every(Boolean)

  const generateRecoveryKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    for (let i = 0; i < 32; i++) {
      if (i > 0 && i % 4 === 0) key += '-'
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return key
  }

  const handleNext = () => {
    if (currentPhase === 1 && formData.username) {
      setCurrentPhase(2)
    } else if (currentPhase === 2 && isPasswordValid(formData.password) && formData.password === formData.confirmPassword) {
      const key = generateRecoveryKey()
      setRecoveryKey(key)
      setCurrentPhase(3)
    }
  }

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryKey)
    alert('Recovery key copied to clipboard!')
  }

  const downloadRecoveryKey = () => {
    const element = document.createElement('a')
    const file = new Blob([`Haven Account Recovery Key\n\nUsername: ${formData.username}\nRecovery Key: ${recoveryKey}\n\nKeep this safe! You'll need it to recover your account if you forget your credentials.\n\nDate Generated: ${new Date().toLocaleString()}`], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `haven-recovery-${formData.username}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-400">Join Haven for secure messaging</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentPhase ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentPhase ? 'bg-blue-600' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          {/* Phase 1: Username Selection */}
          {currentPhase === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Choose Your Anonymous Username</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Custom Username</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Create your own username"
                />
              </div>

              <div className="text-center my-4">
                <span className="text-slate-400 text-sm">or choose from suggestions</span>
              </div>

              <div className="space-y-2">
                {usernameSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData({...formData, username: suggestion})}
                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md text-left transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNext}
                disabled={!formData.username}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors mt-6"
              >
                Next: Create Password
              </button>
            </div>
          )}

          {/* Phase 2: Password Creation */}
          {currentPhase === 2 && (() => {
            const validation = getPasswordValidation(formData.password)
            return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Create Secure Password</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Create a strong password"
                />
              </div>

              {/* Password Requirements */}
              <div className="text-xs space-y-1">
                <div className={`flex items-center space-x-2 ${validation.length ? 'text-green-400' : 'text-slate-400'}`}>
                  <span>{validation.length ? '✓' : '○'}</span>
                  <span>At least 12 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${validation.lowercase ? 'text-green-400' : 'text-slate-400'}`}>
                  <span>{validation.lowercase ? '✓' : '○'}</span>
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${validation.uppercase ? 'text-green-400' : 'text-slate-400'}`}>
                  <span>{validation.uppercase ? '✓' : '○'}</span>
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${validation.number ? 'text-green-400' : 'text-slate-400'}`}>
                  <span>{validation.number ? '✓' : '○'}</span>
                  <span>One number</span>
                </div>
                <div className={`flex items-center space-x-2 ${validation.special ? 'text-green-400' : 'text-slate-400'}`}>
                  <span>{validation.special ? '✓' : '○'}</span>
                  <span>One special character</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Confirm your password"
                />
              </div>

              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="text-red-400 text-sm">Passwords do not match</div>
              )}

              <div className="flex space-x-3">
                <button 
                  onClick={() => setCurrentPhase(1)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!isPasswordValid(formData.password) || formData.password !== formData.confirmPassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Generate Recovery Key
                </button>
              </div>
            </div>
            )
          })()}

          {/* Phase 3: Recovery Key */}
          {currentPhase === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Your Recovery Key</h3>
              
              <div className="bg-slate-700 p-4 rounded-md">
                <p className="text-sm text-slate-300 mb-3">
                  <strong>Important:</strong> This recovery key is your only way to restore access if you forget your username or password. Save it securely!
                </p>
                
                <div className="bg-slate-900 p-3 rounded border border-slate-600 font-mono text-sm break-all">
                  {recoveryKey}
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={copyRecoveryKey}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  📋 Copy Key
                </button>
                <button 
                  onClick={downloadRecoveryKey}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  💾 Download
                </button>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-md">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <div className="text-sm">
                    <strong className="text-yellow-300">Security Notice:</strong>
                    <ul className="mt-1 space-y-1 text-slate-300">
                      <li>• Store this key in a secure location</li>
                      <li>• Don't share it with anyone</li>
                      <li>• Haven cannot recover your account without it</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => {
                  try {
                    const res = await createAccount(formData.username, formData.password, recoveryKey)
                    if (res.success) navigate('/sign-in?registered=1')
                    else alert(res.error || 'Could not create account')
                  } catch (e) {
                    alert('Could not create account. Check your connection.')
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
              >
                Complete Account Creation
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-blue-400 hover:text-blue-300">
                Sign in
              </Link>
            </p>
            <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm mt-2 block">
              ← Back to home
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span>🔒</span>
            <span>Anonymous by design • No email required</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecoverPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [recoveryKey, setRecoveryKey] = useState('')
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getPasswordValidation = (password) => ({
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  })
  const isPasswordValid = (p) => Object.values(getPasswordValidation(p)).every(Boolean)

  const handleLookup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await recoverByKey(recoveryKey)
      if (result.success) {
        setUsername(result.username)
        setStep(2)
      } else {
        setError(result.error || 'Recovery key not found. Enter it exactly as saved.')
      }
    } catch (_) {
      setError('Recovery key not found. Enter it exactly as saved.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!isPasswordValid(newPassword)) {
      setError('Password must meet all requirements (12+ chars, upper, lower, number, special)')
      return
    }
    setLoading(true)
    try {
      const result = await resetPasswordWithRecovery(recoveryKey, newPassword)
      if (result.success) navigate('/sign-in')
      else setError(result.error || 'Something went wrong')
    } catch (_) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Recover Account</h1>
          <p className="text-slate-400">
            {step === 1 ? 'Enter your recovery key' : 'Set a new password'}
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          {step === 1 ? (
            <form onSubmit={handleLookup} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Recovery Key</label>
                <input 
                  type="text" 
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                  placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                  required
                />
                <p className="text-slate-400 text-xs mt-1">Enter exactly as saved when you created your account.</p>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Looking up…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="bg-slate-700 p-3 rounded-md">
                <p className="text-sm text-slate-300">Your username: <strong className="text-white">{username}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="New password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <p className="text-slate-400 text-xs">Same rules: 12+ chars, upper, lower, number, special.</p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setError(''); setRecoveryKey(''); setUsername(''); setNewPassword(''); setConfirmPassword('') }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/sign-in" className="text-slate-500 hover:text-slate-400 text-sm">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [contacts, setContacts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  const [ellipsisMenuOpen, setEllipsisMenuOpen] = useState(false)
  const [disappearingMessagesEnabled, setDisappearingMessagesEnabled] = useState(true)
  const [disappearingMessagesTime, setDisappearingMessagesTime] = useState(2) // days, default 2 days
  const [showDisappearingSettings, setShowDisappearingSettings] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const notifRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const attachMenuRef = useRef(null)
  const ellipsisMenuRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const loadContacts = useCallback(async () => {
    const s = getSession()
    if (!s) return
    const list = await getContacts(s.username)
    setContacts(list)
  }, [])

  const loadNotifications = useCallback(async () => {
    const s = getSession()
    if (!s) return
    const list = await getNotifications(s.username)
    setNotifications(list)
  }, [])

  const loadMessages = useCallback(async (contactUsername) => {
    const s = getSession()
    if (!s || !contactUsername) return
    setLoadingMessages(true)
    try {
      const msgs = await getMessages(s.username, contactUsername)
      setMessages(msgs)
      await markMessagesAsRead(s.username, contactUsername, s.username)
      // Load chat settings
      const settings = await getChatSettings(s.username, contactUsername)
      setDisappearingMessagesEnabled(settings.disappearingEnabled)
      setDisappearingMessagesTime(settings.disappearingDays)
      setIsMuted(settings.muted)
      setIsBlocked(settings.blocked)
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    const s = getSession()
    if (!s) {
      navigate('/sign-in')
      return
    }
    setSession(s)
    loadContacts()
    loadNotifications()
  }, [navigate, loadContacts, loadNotifications])

  useEffect(() => {
    if (!notifOpen) return
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [notifOpen])

  useEffect(() => {
    if (!attachMenuOpen) return
    const onDocClick = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) setAttachMenuOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [attachMenuOpen])

  useEffect(() => {
    if (!ellipsisMenuOpen) return
    const onDocClick = (e) => {
      if (ellipsisMenuRef.current && !ellipsisMenuRef.current.contains(e.target)) setEllipsisMenuOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [ellipsisMenuOpen])

  const runSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      setSearchError('')
      setHasSearched(false)
      setShowSearchResults(false)
      return
    }
    setSearchError('')
    setHasSearched(true)
    setSearching(true)
    setShowSearchResults(true)
    try {
      const me = getSession()?.username ?? ''
      const list = await searchAccounts(q, me)
      setSearchResults(Array.isArray(list) ? list : [])
    } catch (e) {
      setSearchResults([])
      setSearchError('Search failed. Try again.')
    } finally {
      setSearching(false)
    }
  }, [searchQuery])

  useEffect(() => {
    setAddError('')
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchError('')
      setHasSearched(false)
      setShowSearchResults(false)
      return
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(runSearch, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery, runSearch])

  const handleContactClick = (username) => {
    setSelectedContact(username)
    setShowSearchResults(false)
    setSearchQuery('')
    setAttachMenuOpen(false)
    setEllipsisMenuOpen(false)
    setShowContactInfo(false)
    setMessages([])
    loadMessages(username)
  }

  // Load messages when selected contact changes
  useEffect(() => {
    if (selectedContact && session) {
      loadMessages(selectedContact)
    }
  }, [selectedContact, session, loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Periodically refresh messages (every 3 seconds)
  useEffect(() => {
    if (!selectedContact || !session) return
    const interval = setInterval(() => {
      loadMessages(selectedContact)
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedContact, session, loadMessages])

  const handleFileSelect = (type) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*/*'
    input.multiple = false
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        console.log(`Selected ${type}:`, file.name, file.size)
        // TODO: Handle file upload/attachment
        alert(`${type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'File'} selected: ${file.name}`)
      }
    }
    input.click()
    setAttachMenuOpen(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!session || !selectedContact || !messageInput.trim() || sendingMessage) return
    
    setSendingMessage(true)
    try {
      const msg = await sendMessage(session.username, selectedContact, messageInput.trim())
      setMessages((prev) => [...prev, msg])
      setMessageInput('')
      scrollToBottom()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleClearChat = async () => {
    if (!session || !selectedContact) return
    if (confirm('Are you sure you want to clear all messages in this chat?')) {
      await clearChat(session.username, selectedContact)
      setMessages([])
      setEllipsisMenuOpen(false)
    }
  }

  const handleDeleteChat = async () => {
    if (!session || !selectedContact) return
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      await deleteChat(session.username, selectedContact)
      await removeContact(session.username, selectedContact)
      loadContacts()
      setSelectedContact(null)
      setMessages([])
      setEllipsisMenuOpen(false)
    }
  }

  const handleSelectMessages = () => {
    // TODO: Implement message selection mode
    alert('Message selection mode - Coming soon!')
    setEllipsisMenuOpen(false)
  }

  const handleUpdateChatSettings = async (newSettings) => {
    if (!session || !selectedContact) return
    await updateChatSettings(session.username, selectedContact, newSettings)
    setDisappearingMessagesEnabled(newSettings.disappearingEnabled)
    setDisappearingMessagesTime(newSettings.disappearingDays)
    setIsMuted(newSettings.muted)
    setIsBlocked(newSettings.blocked)
  }

  const timeOptions = [
    { label: '24 hours', value: 1 },
    { label: '2 days', value: 2 },
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
    { label: 'Off', value: 0 },
  ]

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const handleAddContact = async (contactUsername) => {
    if (!session) return
    setAddError('')
    setAdding(contactUsername)
    const res = await addContact(session.username, contactUsername)
    setAdding(null)
    if (res.success) {
      await addNotification(contactUsername, `${session.username} added you`)
      loadContacts()
      loadNotifications()
      setSearchQuery('')
      setSearchResults([])
      setShowSearchResults(false)
      setSelectedContact(contactUsername)
    } else {
      setAddError(res.error || 'Could not add')
    }
  }

  const handleRemoveContact = async (contactUsername) => {
    if (!session) return
    await removeContact(session.username, contactUsername)
    loadContacts()
  }

  const handleMarkNotifRead = async (id) => {
    if (!session) return
    await markNotificationRead(session.username, id)
    loadNotifications()
  }

  const handleMarkAllNotifsRead = async () => {
    if (!session) return
    await markAllNotificationsRead(session.username)
    loadNotifications()
  }

  if (!session) return null

  const unread = unreadCount(notifications)
  const displayList = showSearchResults ? searchResults : contacts
  const listTitle = showSearchResults ? 'Search Results' : 'Your Contacts'

  // Get initials for avatar
  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?'
  }

  return (
    <div className="h-screen flex bg-[#0D1B2A] text-[#E0E1DD] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-16 bg-[#1B263B] flex flex-col items-center py-4 border-r border-[#415A77]">
        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center text-white font-semibold mb-6">
          {getInitials(session.username)}
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col gap-4 flex-1">
          <button
            className="relative p-2 rounded-lg hover:bg-[#415A77] transition-colors"
            title="Chats"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#778DA9]" />
          </button>
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen) }}
              className="relative p-2 rounded-lg hover:bg-[#415A77] transition-colors"
              title="Notifications"
            >
              <BellIcon className="w-6 h-6 text-[#778DA9]" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-xs font-bold bg-[#E74C3C] text-white rounded-full">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute left-full ml-2 top-0 w-80 max-h-96 overflow-y-auto bg-[#1B263B] border border-[#415A77] rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-[#415A77] flex items-center justify-between">
                  <span className="font-semibold text-[#E0E1DD]">Notifications</span>
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllNotifsRead}
                      className="text-sm text-[#778DA9] hover:text-[#E0E1DD]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#415A77]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-[#778DA9] text-sm">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleMarkNotifRead(n.id)}
                        className={`w-full text-left p-3 hover:bg-[#415A77]/30 transition-colors ${!n.read ? 'bg-[#415A77]/20' : ''}`}
                      >
                        <p className="text-sm text-[#E0E1DD]">{n.message}</p>
                        <p className="text-xs text-[#778DA9] mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg hover:bg-[#415A77] transition-colors"
          title="Sign Out"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-[#778DA9]" />
        </button>
      </div>

      {/* Left Panel - Contacts/Search */}
      <div className="w-96 flex flex-col bg-[#1B263B] border-r border-[#415A77]">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-[#1B263B] border-b border-[#415A77]">
          <h1 className="text-xl font-semibold text-[#E0E1DD]">Haven</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-[#415A77] transition-colors">
              <PlusIcon className="w-5 h-5 text-[#778DA9]" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#415A77] transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5 text-[#778DA9]" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#1B263B] border-b border-[#415A77]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#778DA9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runSearch())}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchResults(true)
              }}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-2 bg-[#0D1B2A] border border-[#415A77] rounded-lg text-[#E0E1DD] placeholder-[#778DA9] focus:outline-none focus:ring-2 focus:ring-[#778DA9] focus:border-transparent"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#778DA9] text-sm">Searching…</span>
            )}
          </div>
          {searchError && (
            <div className="mt-2 text-sm text-[#E74C3C]">{searchError}</div>
          )}
          {addError && (
            <div className="mt-2 text-sm text-[#E74C3C]">{addError}</div>
          )}
        </div>

        {/* Contacts/Search Results List */}
        <div className="flex-1 overflow-y-auto">
          {showSearchResults ? (
            <>
              {hasSearched && !searching && searchQuery.trim() && searchResults.length === 0 && !searchError && (
                <div className="p-4 text-center text-[#778DA9] text-sm">
                  No users found. Create another account to search for it.
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-[#778DA9] uppercase">Search Results</div>
                  {searchResults.map((u) => {
                    const isContact = contacts.includes(u)
                    const busy = adding === u
                    return (
                      <div
                        key={u}
                        className={`px-4 py-3 flex items-center gap-3 hover:bg-[#415A77]/30 cursor-pointer transition-colors ${selectedContact === u ? 'bg-[#415A77]/40' : ''}`}
                        onClick={() => !isContact && handleContactClick(u)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {getInitials(u)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#E0E1DD] truncate">{u}</div>
                          <div className="text-xs text-[#778DA9]">
                            {isContact ? 'Already added' : 'Click to view'}
                          </div>
                        </div>
                        {!isContact && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddContact(u)
                            }}
                            disabled={busy}
                            className="px-3 py-1 text-sm bg-gradient-to-r from-[#415A77] to-[#778DA9] hover:from-[#778DA9] hover:to-[#A3B1C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-all whitespace-nowrap"
                          >
                            {busy ? 'Adding…' : 'Add'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-[#778DA9] text-sm mb-2">No contacts yet</p>
                  <p className="text-[#778DA9] text-xs">Search above to add accounts</p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-[#778DA9] uppercase">Your Contacts</div>
                  {contacts.map((u) => (
                    <div
                      key={u}
                      className={`px-4 py-3 flex items-center gap-3 hover:bg-[#415A77]/30 cursor-pointer transition-colors ${selectedContact === u ? 'bg-[#415A77]/40' : ''}`}
                      onClick={() => handleContactClick(u)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {getInitials(u)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#E0E1DD] truncate">{u}</div>
                        <div className="text-xs text-[#778DA9]">End-to-end encrypted</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveContact(u)
                        }}
                        className="p-1 rounded hover:bg-[#415A77]/50 transition-colors"
                        title="Remove contact"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5 text-[#778DA9]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Selected Contact/Empty State */}
      <div className="flex-1 flex flex-col bg-[#0D1B2A]">
        {selectedContact ? (
          <>
            {/* Contact Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-[#1B263B] border-b border-[#415A77]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center text-white font-semibold">
                  {getInitials(selectedContact)}
                </div>
                <div>
                  <div className="font-semibold text-[#E0E1DD]">{selectedContact}</div>
                  <div className="text-xs text-[#778DA9]">End-to-end encrypted</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-[#415A77] transition-colors">
                  <MagnifyingGlassIcon className="w-5 h-5 text-[#778DA9]" />
                </button>
                <div className="relative" ref={ellipsisMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEllipsisMenuOpen(!ellipsisMenuOpen)
                    }}
                    className="p-2 rounded-lg hover:bg-[#415A77] transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-[#778DA9]" />
                  </button>
                  {ellipsisMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1B263B] border border-[#415A77] rounded-lg shadow-xl z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowContactInfo(true)
                            setEllipsisMenuOpen(false)
                          }}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                        >
                          <InformationCircleIcon className="w-5 h-5 text-[#778DA9]" />
                          <span>Contact info</span>
                        </button>
                        <button
                          onClick={handleSelectMessages}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                        >
                          <CheckIcon className="w-5 h-5 text-[#778DA9]" />
                          <span>Select messages</span>
                        </button>
                        <button
                          onClick={async () => {
                            const newSettings = {
                              disappearingEnabled: disappearingMessagesEnabled,
                              disappearingDays: disappearingMessagesTime,
                              muted: !isMuted,
                              blocked: isBlocked,
                            }
                            await handleUpdateChatSettings(newSettings)
                            setEllipsisMenuOpen(false)
                          }}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                        >
                          {isMuted ? (
                            <BellIcon className="w-5 h-5 text-[#778DA9]" />
                          ) : (
                            <BellSlashIcon className="w-5 h-5 text-[#778DA9]" />
                          )}
                          <span>{isMuted ? 'Unmute notifications' : 'Mute notifications'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowDisappearingSettings(true)
                            setEllipsisMenuOpen(false)
                          }}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                        >
                          <ClockIcon className="w-5 h-5 text-[#778DA9]" />
                          <span>Disappearing messages</span>
                        </button>
                        <div className="border-t border-[#415A77] my-1"></div>
                        <button
                          onClick={handleClearChat}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                        >
                          <MinusCircleIcon className="w-5 h-5 text-[#778DA9]" />
                          <span>Clear chat</span>
                        </button>
                        <button
                          onClick={handleDeleteChat}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E74C3C]"
                        >
                          <TrashIcon className="w-5 h-5 text-[#E74C3C]" />
                          <span>Delete chat</span>
                        </button>
                        <div className="border-t border-[#415A77] my-1"></div>
                        <button
                          onClick={async () => {
                            const newSettings = {
                              disappearingEnabled: disappearingMessagesEnabled,
                              disappearingDays: disappearingMessagesTime,
                              muted: isMuted,
                              blocked: !isBlocked,
                            }
                            await handleUpdateChatSettings(newSettings)
                            setEllipsisMenuOpen(false)
                          }}
                          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E74C3C]"
                        >
                          <NoSymbolIcon className="w-5 h-5 text-[#E74C3C]" />
                          <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative" ref={chatContainerRef}>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-[#778DA9]">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#E0E1DD] mb-2">{selectedContact}</h3>
                      <p className="text-[#778DA9] text-sm mb-4">
                        Your messages are end-to-end encrypted. No one outside of this chat can read them.
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B263B] border border-[#415A77] rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
                        <span className="text-xs text-[#778DA9]">Encrypted</span>
                      </div>
                      {disappearingMessagesEnabled && disappearingMessagesTime > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1B263B] border border-[#415A77] rounded-lg">
                          <ClockIcon className="w-4 h-4 text-[#778DA9]" />
                          <span className="text-xs text-[#778DA9]">
                            Messages disappear after {disappearingMessagesTime} {disappearingMessagesTime === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Encryption notice at top of chat */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1B263B] border border-[#415A77] rounded-full text-xs text-[#778DA9]">
                        <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
                        <span>Messages are end-to-end encrypted</span>
                        {disappearingMessagesEnabled && disappearingMessagesTime > 0 && (
                          <>
                            <span className="mx-1">•</span>
                            <ClockIcon className="w-3 h-3" />
                            <span>{disappearingMessagesTime}d</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Messages */}
                    {messages.map((msg) => {
                      const isOwn = msg.from === session?.username
                      const msgDate = new Date(msg.createdAt)
                      const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-gradient-to-r from-[#415A77] to-[#778DA9] text-white rounded-br-md'
                                : 'bg-[#1B263B] text-[#E0E1DD] rounded-bl-md'
                            }`}
                          >
                            {msg.type === 'text' ? (
                              <p className="break-words">{msg.content}</p>
                            ) : (
                              <div className="flex items-center gap-2">
                                {msg.type === 'image' && <PhotoIcon className="w-5 h-5" />}
                                {msg.type === 'video' && <VideoCameraIcon className="w-5 h-5" />}
                                {msg.type === 'file' && <DocumentIcon className="w-5 h-5" />}
                                <span className="text-sm">{msg.fileName || msg.content}</span>
                              </div>
                            )}
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-[#778DA9]'}`}>
                                {timeStr}
                              </span>
                              {isOwn && (
                                <span className={`text-xs ${msg.read ? 'text-[#2ECC71]' : 'text-white/50'}`}>
                                  {msg.read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Contact Info Modal */}
              {showContactInfo && (
                <div className="absolute inset-0 bg-[#0D1B2A]/80 flex items-center justify-center z-50" onClick={() => setShowContactInfo(false)}>
                  <div className="bg-[#1B263B] border border-[#415A77] rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-[#415A77] flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[#E0E1DD]">Contact Info</h3>
                      <button
                        onClick={() => setShowContactInfo(false)}
                        className="p-1 rounded-lg hover:bg-[#415A77] transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-[#778DA9]" />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center text-white font-semibold text-2xl mb-3">
                          {getInitials(selectedContact)}
                        </div>
                        <h4 className="text-xl font-semibold text-[#E0E1DD] mb-1">{selectedContact}</h4>
                        <p className="text-sm text-[#778DA9]">Username</p>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-[#0D1B2A] rounded-lg">
                          <p className="text-xs text-[#778DA9] mb-1">Status</p>
                          <p className="text-sm text-[#E0E1DD]">End-to-end encrypted</p>
                        </div>
                        {isMuted && (
                          <div className="p-3 bg-[#0D1B2A] rounded-lg">
                            <p className="text-xs text-[#778DA9] mb-1">Notifications</p>
                            <p className="text-sm text-[#E0E1DD]">Muted</p>
                          </div>
                        )}
                        {isBlocked && (
                          <div className="p-3 bg-[#0D1B2A] rounded-lg">
                            <p className="text-xs text-[#778DA9] mb-1">Status</p>
                            <p className="text-sm text-[#E74C3C]">Blocked</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disappearing Messages Settings Modal */}
              {showDisappearingSettings && (
                <div className="absolute inset-0 bg-[#0D1B2A]/80 flex items-center justify-center z-50" onClick={() => setShowDisappearingSettings(false)}>
                  <div className="bg-[#1B263B] border border-[#415A77] rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-[#415A77] flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[#E0E1DD]">Disappearing Messages</h3>
                      <button
                        onClick={() => setShowDisappearingSettings(false)}
                        className="p-1 rounded-lg hover:bg-[#415A77] transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-[#778DA9]" />
                      </button>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-[#778DA9] mb-4">
                        New messages in this chat will disappear after the selected time period.
                      </p>
                      <div className="space-y-2">
                        {timeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={async () => {
                              const newSettings = {
                                disappearingEnabled: option.value !== 0,
                                disappearingDays: option.value === 0 ? 2 : option.value,
                                muted: isMuted,
                                blocked: isBlocked,
                              }
                              await handleUpdateChatSettings(newSettings)
                            }}
                            className={`w-full px-4 py-3 flex items-center justify-between rounded-lg border transition-colors ${
                              (option.value === 0 && !disappearingMessagesEnabled) ||
                              (option.value > 0 && disappearingMessagesEnabled && disappearingMessagesTime === option.value)
                                ? 'bg-[#415A77]/30 border-[#778DA9]'
                                : 'bg-[#0D1B2A] border-[#415A77] hover:bg-[#415A77]/20'
                            }`}
                          >
                            <span className="text-[#E0E1DD]">{option.label}</span>
                            {(option.value === 0 && !disappearingMessagesEnabled) ||
                            (option.value > 0 && disappearingMessagesEnabled && disappearingMessagesTime === option.value) ? (
                              <CheckIcon className="w-5 h-5 text-[#778DA9]" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                      {disappearingMessagesEnabled && disappearingMessagesTime > 0 && (
                        <div className="mt-4 p-3 bg-[#0D1B2A] rounded-lg">
                          <p className="text-xs text-[#778DA9]">
                            Messages will disappear {disappearingMessagesTime === 1 ? 'in 24 hours' : `after ${disappearingMessagesTime} days`} from when they are sent.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="h-16 px-4 flex items-center gap-2 bg-[#1B263B] border-t border-[#415A77]">
              <div className="relative" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAttachMenuOpen(!attachMenuOpen)
                  }}
                  className="p-2 rounded-lg hover:bg-[#415A77] transition-colors"
                >
                  <PlusIcon className="w-5 h-5 text-[#778DA9]" />
                </button>
                {attachMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1B263B] border border-[#415A77] rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleFileSelect('image')}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                      >
                        <PhotoIcon className="w-5 h-5 text-[#778DA9]" />
                        <div>
                          <div className="font-medium">Photo & Video</div>
                          <div className="text-xs text-[#778DA9]">Images and videos</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileSelect('video')}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                      >
                        <VideoCameraIcon className="w-5 h-5 text-[#778DA9]" />
                        <div>
                          <div className="font-medium">Video</div>
                          <div className="text-xs text-[#778DA9]">Video files</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileSelect('file')}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#415A77]/30 text-left text-[#E0E1DD]"
                      >
                        <PaperClipIcon className="w-5 h-5 text-[#778DA9]" />
                        <div>
                          <div className="font-medium">Document</div>
                          <div className="text-xs text-[#778DA9]">Files and documents</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isBlocked || sendingMessage}
                className="flex-1 px-4 py-2 bg-[#0D1B2A] border border-[#415A77] rounded-lg text-[#E0E1DD] placeholder-[#778DA9] focus:outline-none focus:ring-2 focus:ring-[#778DA9] disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!messageInput.trim() || sendingMessage || isBlocked}
                className="p-2 rounded-lg hover:bg-[#415A77] transition-colors disabled:opacity-50"
              >
                {sendingMessage ? (
                  <span className="text-[#778DA9]">...</span>
                ) : (
                  <svg className="w-5 h-5 text-[#778DA9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#415A77] to-[#778DA9] flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#E0E1DD] mb-2">Welcome to Haven</h2>
              <p className="text-[#778DA9] mb-4">
                Select a contact from the list to start a conversation, or search for users to add.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B263B] border border-[#415A77] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
                <span className="text-sm text-[#778DA9]">Your conversations are end-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/recover" element={<RecoverPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
