import { useState } from 'react'
import { Clock, Shield, Check, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export default function DisappearingMessages({ currentSetting = '24h', onUpdate, onClose }) {
  const [selectedTime, setSelectedTime] = useState(currentSetting)

  const timeOptions = [
    { value: '5m', label: '5 minutes', description: 'Ultra-secure for sensitive information' },
    { value: '1h', label: '1 hour', description: 'Secure for confidential discussions' },
    { value: '24h', label: '24 hours', description: 'Standard security for regular conversations' },
    { value: '7d', label: '7 days', description: 'Extended time for reference materials' },
    { value: 'off', label: 'Never', description: 'Messages persist until manually deleted' }
  ]

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(selectedTime)
    }
    onClose()
  }

  const getSecurityLevel = (time) => {
    switch (time) {
      case '5m': return { level: 'Maximum', color: 'text-red-500' }
      case '1h': return { level: 'High', color: 'text-orange-500' }
      case '24h': return { level: 'Standard', color: 'text-success' }
      case '7d': return { level: 'Extended', color: 'text-blue-500' }
      case 'off': return { level: 'Persistent', color: 'text-muted-foreground' }
      default: return { level: 'Standard', color: 'text-success' }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Disappearing Messages</span>
              </CardTitle>
              <CardDescription>
                Configure automatic message deletion for enhanced privacy
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Time Options */}
          <div className="space-y-2">
            {timeOptions.map((option) => {
              const security = getSecurityLevel(option.value)
              const isSelected = selectedTime === option.value
              
              return (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTime(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{option.label}</span>
                        <span className={`text-xs px-2 py-1 rounded-full bg-muted ${security.color}`}>
                          {security.level}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div className="ml-3">
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Security Notice */}
          <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
            <Shield className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Privacy Notice:</p>
              <p>
                Messages are permanently deleted from all devices when the timer expires. 
                This setting applies to new messages in this conversation.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Apply Setting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}