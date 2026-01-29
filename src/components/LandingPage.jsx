import { Shield, Lock, Clock, Moon, Sun } from 'lucide-react'
import { Button } from './ui/Button'

export default function LandingPage({ onGetStarted, onSignIn }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold font-serif">Haven</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Moon className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onSignIn} className="text-white border-white/30 hover:bg-white hover:text-slate-900">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-6xl md:text-7xl font-bold font-serif mb-8 leading-tight">
          Private Communication<br />
          <span className="text-primary">For Everyone</span>
        </h1>
        
        <p className="text-xl text-slate-300 max-w-3xl mb-12 leading-relaxed">
          Haven is a sanctuary for secure messaging. End-to-end encrypted, anonymous, and built for those who value their privacy.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-lg font-medium"
          >
            <Shield className="h-5 w-5 mr-2" />
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onSignIn}
            className="text-white border-white/30 hover:bg-white hover:text-slate-900 px-8 py-4 text-lg rounded-lg font-medium"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* End-to-End Encrypted */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">End-to-End Encrypted</h3>
            <p className="text-slate-300 leading-relaxed">
              Your messages are encrypted before they leave your device. Only you and your recipient can read them.
            </p>
          </div>

          {/* Anonymous by Design */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Anonymous by Design</h3>
            <p className="text-slate-300 leading-relaxed">
              No phone number required. Create an account with just a username and password.
            </p>
          </div>

          {/* Disappearing Messages */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Disappearing Messages</h3>
            <p className="text-slate-300 leading-relaxed">
              Set messages to automatically delete. Leave no trace of your conversations.
            </p>
          </div>
        </div>
      </div>

      {/* Security Features Section */}
      <div className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 font-serif">Built for Privacy Advocates</h2>
          <p className="text-xl text-slate-300 mb-12 leading-relaxed">
            Every feature is designed with security and privacy as the foundation, 
            not an afterthought.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Zero-knowledge architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">No metadata collection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Forward secrecy</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Screen capture protection</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Secure file sharing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Anonymous identity generation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Threat model visualization</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-slate-300">Open source & auditable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 font-serif">Ready to Reclaim Your Privacy?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Join thousands of journalists, activists, and privacy advocates who trust Haven 
            for their most sensitive communications.
          </p>
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg rounded-lg font-medium"
          >
            <Shield className="h-5 w-5 mr-2" />
            Start Secure Messaging
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold font-serif">Haven</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p className="mb-2">Your conversations are yours alone.</p>
              <p className="text-sm">Privacy-first messaging for everyone.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}