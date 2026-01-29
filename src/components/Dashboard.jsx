import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, MessageCircle, Settings, Search, Send, Paperclip, Lock, Eye, EyeOff, MoreVertical, LogOut, User, Clock, Upload, UserPlus, BarChart3 } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { pseudoEmailToUsername } from '../lib/identity'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import SecureFileTransfer from './SecureFileTransfer'
import DisappearingMessages from './DisappearingMessages'
import SecureIdentityGenerator from './SecureIdentityGenerator'
import ThreatModelVisualizer from './ThreatModelVisualizer'
import ContactManager from './ContactManager'

export default function Dashboard() {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  
  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSecurityPanel, setShowSecurityPanel] = useState(false)
  const [showFileTransfer, setShowFileTransfer] = useState(false)
  const [showDisappearingMessages, setShowDisappearingMessages] = useState(false)
  const [showIdentityGenerator, setShowIdentityGenerator] = useState(false)
  const [showThreatModel, setShowThreatModel] = useState(false)
  const [showContactManager, setShowContactManager] = useState(false)
  const [disappearingTime, setDisappearingTime] = useState('24h')

  const user = session?.user
  const username = user?.user_metadata?.username || pseudoEmailToUsername(user?.email || '')

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Mock data for contacts and messages
  const contacts = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      lastMessage: 'The documents are secure now.',
      timestamp: '2m ago',
      unread: 2,
      isOnline: true,
      encryptionLevel: 'high'
    },
    {
      id: 2,
      name: 'Anonymous Source',
      lastMessage: 'Meeting confirmed for tomorrow.',
      timestamp: '15m ago',
      unread: 0,
      isOnline: false,
      encryptionLevel: 'maximum'
    },
    {
      id: 3,
      name: 'Editorial Team',
      lastMessage: 'Story looks good, ready to publish?',
      timestamp: '1h ago',
      unread: 1,
      isOnline: true,
      encryptionLevel: 'high'
    }
  ]

  const messages = [
    {
      id: 1,
      sender: 'Sarah Mitchell',
      content: 'I have the information you requested about the government contract.',
      timestamp: '10:32 AM',
      isOwn: false,
      isEncrypted: true
    },
    {
      id: 2,
      sender: 'You',
      content: 'Perfect. Can you send it through our secure channel?',
      timestamp: '10:35 AM',
      isOwn: true,
      isEncrypted: true
    },
    {
      id: 3,
      sender: 'Sarah Mitchell',
      content: 'The documents are secure now. Check your encrypted folder.',
      timestamp: '10:38 AM',
      isOwn: false,
      isEncrypted: true
    }
  ]

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    
    console.log('Sending encrypted message:', message)
    setMessage('')
  }

  const handleFileUpload = (files) => {
    console.log('Files uploaded:', files)
    setShowFileTransfer(false)
  }

  const handleDisappearingUpdate = (time) => {
    setDisappearingTime(time)
    console.log('Disappearing messages updated:', time)
  }

  const handleIdentityGenerated = (identity) => {
    console.log('New identity generated:', identity)
    setShowIdentityGenerator(false)
  }

  const handleContactSelected = (contact) => {
    setSelectedChat(contact)
    setShowContactManager(false)
  }

  const SecurityStatus = () => (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Lock className="h-4 w-4 text-success" />
      <span>End-to-end encrypted</span>
      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-serif">Haven</h1>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowContactManager(true)}
                title="Manage Contacts"
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowIdentityGenerator(true)}
                title="Generate New Identity"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSecurityPanel(!showSecurityPanel)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4 p-2 rounded-lg bg-muted/30">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{username || 'Anonymous User'}</div>
              <div className="text-xs text-muted-foreground">Secure Identity</div>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedChat(contact)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.id === contact.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm truncate">{contact.name}</span>
                      {contact.encryptionLevel === 'maximum' && (
                        <Shield className="h-3 w-3 text-success" />
                      )}
                      {contact.isOnline && (
                        <div className="h-2 w-2 rounded-full bg-success" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {contact.lastMessage}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                      {contact.unread > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h2 className="font-semibold">{selectedChat.name}</h2>
                    <SecurityStatus />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowDisappearingMessages(true)}
                    title="Disappearing Messages"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.isEncrypted && (
                        <Lock className="h-3 w-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowFileTransfer(true)}
                  title="Secure File Transfer"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a secure message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex items-center justify-center mt-2">
                <SecurityStatus />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 font-serif">Welcome to Haven</h2>
              <p className="text-muted-foreground">Select a conversation to start secure messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Security Panel */}
      {showSecurityPanel && (
        <div className="w-80 bg-card border-l border-border p-4">
          <h3 className="font-semibold mb-4 font-serif">Security Status</h3>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Encryption Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm">Maximum Security</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Threats Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">247</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Disappearing Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-delete after</span>
                  <span className="text-sm font-medium">{disappearingTime === '24h' ? '24 hours' : disappearingTime}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThreatModel(true)}
              className="w-full flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Threat Analysis</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showFileTransfer && (
        <SecureFileTransfer
          onFileUpload={handleFileUpload}
          onClose={() => setShowFileTransfer(false)}
        />
      )}

      {showDisappearingMessages && (
        <DisappearingMessages
          currentSetting={disappearingTime}
          onUpdate={handleDisappearingUpdate}
          onClose={() => setShowDisappearingMessages(false)}
        />
      )}

      {showIdentityGenerator && (
        <SecureIdentityGenerator
          onGenerate={handleIdentityGenerated}
          onClose={() => setShowIdentityGenerator(false)}
        />
      )}

      {showThreatModel && (
        <ThreatModelVisualizer
          onClose={() => setShowThreatModel(false)}
        />
      )}

      {showContactManager && (
        <ContactManager
          onClose={() => setShowContactManager(false)}
          onSelectContact={handleContactSelected}
        />
      )}
    </div>
  )
}