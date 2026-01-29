import { useState } from 'react'
import { Users, Plus, Search, Shield, MoreVertical, Trash2, Edit, Copy, X, Check, AlertTriangle, User } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export default function ContactManager({ onClose, onSelectContact }) {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Sarah Mitchell',
      username: 'ShadowJournalist2023',
      publicKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
      encryptionLevel: 'maximum',
      isVerified: true,
      lastSeen: '2m ago',
      isOnline: true,
      addedDate: '2025-01-15'
    },
    {
      id: 2,
      name: 'Anonymous Source',
      username: 'DeepThroat_v2',
      publicKey: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k',
      encryptionLevel: 'maximum',
      isVerified: false,
      lastSeen: '15m ago',
      isOnline: false,
      addedDate: '2025-01-10'
    },
    {
      id: 3,
      name: 'Editorial Team',
      username: 'NewsroomSecure',
      publicKey: '0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      encryptionLevel: 'high',
      isVerified: true,
      lastSeen: '1h ago',
      isOnline: true,
      addedDate: '2025-01-05'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [newContact, setNewContact] = useState({
    name: '',
    username: '',
    publicKey: ''
  })
  const [copied, setCopied] = useState('')

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.username || !newContact.publicKey) {
      return
    }

    const contact = {
      id: Date.now(),
      ...newContact,
      encryptionLevel: 'high',
      isVerified: false,
      lastSeen: 'Never',
      isOnline: false,
      addedDate: new Date().toISOString().split('T')[0]
    }

    setContacts(prev => [...prev, contact])
    setNewContact({ name: '', username: '', publicKey: '' })
    setShowAddContact(false)
  }

  const handleDeleteContact = (contactId) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
    setSelectedContact(null)
  }

  const getEncryptionColor = (level) => {
    switch (level) {
      case 'maximum': return 'text-red-500 bg-red-50'
      case 'high': return 'text-orange-500 bg-orange-50'
      case 'medium': return 'text-yellow-500 bg-yellow-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Contact Manager</span>
              </CardTitle>
              <CardDescription>
                Manage your secure contacts and encryption keys
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex h-[600px]">
            {/* Contact List */}
            <div className="w-1/2 border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddContact(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-y-auto h-[520px]">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 border-b border-border cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm truncate">{contact.name}</span>
                          {contact.isVerified && (
                            <Shield className="h-3 w-3 text-success" />
                          )}
                          {contact.isOnline && (
                            <div className="h-2 w-2 rounded-full bg-success" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          @{contact.username}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{contact.lastSeen}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getEncryptionColor(contact.encryptionLevel)}`}>
                            {contact.encryptionLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="w-1/2">
              {selectedContact ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedContact.name}</h3>
                        <p className="text-sm text-muted-foreground">@{selectedContact.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(selectedContact.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Public Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={selectedContact.publicKey}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(selectedContact.publicKey, 'key')}
                        >
                          {copied === 'key' ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Encryption Level</Label>
                        <div className={`mt-1 px-3 py-2 rounded-lg text-sm ${getEncryptionColor(selectedContact.encryptionLevel)}`}>
                          {selectedContact.encryptionLevel.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Verification Status</Label>
                        <div className="mt-1 flex items-center space-x-2">
                          {selectedContact.isVerified ? (
                            <>
                              <Shield className="h-4 w-4 text-success" />
                              <span className="text-sm text-success">Verified</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              <span className="text-sm text-warning">Unverified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Contact Information</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Added:</span>
                          <span>{selectedContact.addedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Seen:</span>
                          <span>{selectedContact.lastSeen}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={selectedContact.isOnline ? 'text-success' : 'text-muted-foreground'}>
                            {selectedContact.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      className="w-full"
                      onClick={() => {
                        onSelectContact(selectedContact)
                        onClose()
                      }}
                    >
                      Start Secure Conversation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a contact to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Contact</CardTitle>
              <CardDescription>
                Enter the contact's information to establish secure communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactName">Display Name</Label>
                <Input
                  id="contactName"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="contactUsername">Username</Label>
                <Input
                  id="contactUsername"
                  value={newContact.username}
                  onChange={(e) => setNewContact(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="SecureUser123"
                />
              </div>
              <div>
                <Label htmlFor="contactKey">Public Key</Label>
                <Input
                  id="contactKey"
                  value={newContact.publicKey}
                  onChange={(e) => setNewContact(prev => ({ ...prev, publicKey: e.target.value }))}
                  placeholder="0x1234567890abcdef..."
                  className="font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddContact(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}