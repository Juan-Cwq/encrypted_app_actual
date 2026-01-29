import { useState, useEffect } from 'react'
import { RefreshCw, Copy, Shield, Eye, EyeOff, Check, X, Dice6 } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export default function SecureIdentityGenerator({ onGenerate, onClose }) {
  const [identity, setIdentity] = useState({
    username: '',
    displayName: '',
    recoveryPhrase: '',
    publicKey: ''
  })
  const [showRecovery, setShowRecovery] = useState(false)
  const [copied, setCopied] = useState('')
  const [strength, setStrength] = useState(0)

  const adjectives = ['Silent', 'Swift', 'Shadow', 'Cipher', 'Phantom', 'Ghost', 'Stealth', 'Mystic', 'Hidden', 'Secure']
  const nouns = ['Wolf', 'Eagle', 'Raven', 'Fox', 'Falcon', 'Tiger', 'Lion', 'Bear', 'Hawk', 'Shark']
  const words = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Hotel', 'India', 'Juliet', 'Kilo']

  const generateIdentity = () => {
    // Generate random username
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 9999)
    const username = `${adjective}${noun}${number}`

    // Generate display name
    const displayName = `${adjective} ${noun}`

    // Generate recovery phrase (12 words)
    const phrase = []
    for (let i = 0; i < 12; i++) {
      const wordList = [...adjectives, ...nouns, ...words]
      phrase.push(wordList[Math.floor(Math.random() * wordList.length)].toLowerCase())
    }
    const recoveryPhrase = phrase.join(' ')

    // Generate mock public key
    const publicKey = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    const newIdentity = {
      username,
      displayName,
      recoveryPhrase,
      publicKey: `0x${publicKey}`
    }

    setIdentity(newIdentity)
    calculateStrength(newIdentity)
  }

  const calculateStrength = (id) => {
    let score = 0
    if (id.username.length >= 8) score += 25
    if (id.recoveryPhrase.split(' ').length >= 12) score += 25
    if (id.publicKey.length >= 64) score += 25
    if (/[A-Z]/.test(id.username) && /[0-9]/.test(id.username)) score += 25
    setStrength(score)
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleUseIdentity = () => {
    if (onGenerate) {
      onGenerate(identity)
    }
    onClose()
  }

  useEffect(() => {
    generateIdentity()
  }, [])

  const getStrengthColor = () => {
    if (strength >= 75) return 'bg-success'
    if (strength >= 50) return 'bg-warning'
    return 'bg-destructive'
  }

  const getStrengthLabel = () => {
    if (strength >= 75) return 'High Security'
    if (strength >= 50) return 'Medium Security'
    return 'Low Security'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure Identity Generator</span>
              </CardTitle>
              <CardDescription>
                Generate an anonymous identity for secure communication
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Security Strength Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Identity Strength</Label>
              <span className="text-sm text-muted-foreground">{getStrengthLabel()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Anonymous Username</Label>
            <div className="flex space-x-2">
              <Input
                id="username"
                value={identity.username}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(identity.username, 'username')}
              >
                {copied === 'username' ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex space-x-2">
              <Input
                id="displayName"
                value={identity.displayName}
                readOnly
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(identity.displayName, 'displayName')}
              >
                {copied === 'displayName' ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Recovery Phrase */}
          <div className="space-y-2">
            <Label htmlFor="recovery">Recovery Phrase</Label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  id="recovery"
                  type={showRecovery ? 'text' : 'password'}
                  value={identity.recoveryPhrase}
                  readOnly
                  className="font-mono pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowRecovery(!showRecovery)}
                >
                  {showRecovery ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(identity.recoveryPhrase, 'recovery')}
              >
                {copied === 'recovery' ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Store this safely. You'll need it to recover your identity.
            </p>
          </div>

          {/* Public Key */}
          <div className="space-y-2">
            <Label htmlFor="publicKey">Public Key</Label>
            <div className="flex space-x-2">
              <Input
                id="publicKey"
                value={identity.publicKey}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(identity.publicKey, 'publicKey')}
              >
                {copied === 'publicKey' ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Privacy & Security:</p>
                <ul className="space-y-1">
                  <li>• Identity generated locally and never stored on servers</li>
                  <li>• Recovery phrase enables identity restoration</li>
                  <li>• Public key used for end-to-end encryption</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={generateIdentity}
              className="flex items-center space-x-2"
            >
              <Dice6 className="h-4 w-4" />
              <span>Generate New</span>
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleUseIdentity}>
                Use Identity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}