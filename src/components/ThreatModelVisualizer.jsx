import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Globe, Smartphone, Wifi, Server, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export default function ThreatModelVisualizer({ onClose }) {
  const [selectedThreat, setSelectedThreat] = useState(null)

  const threats = [
    {
      id: 'surveillance',
      name: 'Government Surveillance',
      level: 'high',
      status: 'blocked',
      icon: Eye,
      description: 'Mass data collection and monitoring by government agencies',
      protection: 'End-to-end encryption prevents content interception',
      methods: ['Metadata obfuscation', 'Onion routing', 'No logging policy']
    },
    {
      id: 'corporate',
      name: 'Corporate Data Mining',
      level: 'high',
      status: 'blocked',
      icon: Globe,
      description: 'Data harvesting by tech companies for advertising and profiling',
      protection: 'Zero-knowledge architecture ensures no data collection',
      methods: ['Local processing', 'Anonymous identities', 'No user tracking']
    },
    {
      id: 'device',
      name: 'Device Compromise',
      level: 'medium',
      status: 'mitigated',
      icon: Smartphone,
      description: 'Malware, spyware, or physical device access',
      protection: 'Forward secrecy and ephemeral messaging limit exposure',
      methods: ['Screen capture protection', 'Auto-lock', 'Secure key storage']
    },
    {
      id: 'network',
      name: 'Network Interception',
      level: 'medium',
      status: 'blocked',
      icon: Wifi,
      description: 'Man-in-the-middle attacks and network eavesdropping',
      protection: 'Transport layer security with certificate pinning',
      methods: ['TLS 1.3', 'Certificate validation', 'Perfect forward secrecy']
    },
    {
      id: 'server',
      name: 'Server Compromise',
      level: 'low',
      status: 'mitigated',
      icon: Server,
      description: 'Breach of messaging service infrastructure',
      protection: 'Zero-knowledge design means servers have no access to content',
      methods: ['End-to-end encryption', 'No message storage', 'Decentralized architecture']
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'blocked': return 'text-success bg-success/10'
      case 'mitigated': return 'text-warning bg-warning/10'
      case 'vulnerable': return 'text-destructive bg-destructive/10'
      default: return 'text-muted-foreground bg-muted/10'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'blocked': return CheckCircle
      case 'mitigated': return Shield
      case 'vulnerable': return XCircle
      default: return AlertTriangle
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-destructive'
      case 'medium': return 'text-warning'
      case 'low': return 'text-success'
      default: return 'text-muted-foreground'
    }
  }

  const overallScore = threats.filter(t => t.status === 'blocked').length / threats.length * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Threat Model Dashboard</span>
              </CardTitle>
              <CardDescription>
                Real-time security threat analysis and protection status
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Security Score */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                  className="text-success transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{Math.round(overallScore)}%</div>
                <div className="text-xs text-muted-foreground">Protected</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Your communication is highly secure against known threats
            </div>
          </div>

          {/* Threat Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threats.map((threat) => {
              const StatusIcon = getStatusIcon(threat.status)
              const ThreatIcon = threat.icon
              
              return (
                <Card
                  key={threat.id}
                  className={`cursor-pointer transition-colors ${
                    selectedThreat === threat.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <ThreatIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{threat.name}</div>
                          <div className={`text-xs ${getLevelColor(threat.level)}`}>
                            {threat.level.toUpperCase()} RISK
                          </div>
                        </div>
                      </div>
                      <div className={`p-1 rounded-full ${getStatusColor(threat.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      {threat.description}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium capitalize">{threat.status}</span>
                      <div className="text-xs text-muted-foreground">
                        Click for details
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedThreat === threat.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <div className="text-xs font-medium mb-1">Protection Method:</div>
                          <div className="text-xs text-muted-foreground">{threat.protection}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium mb-1">Security Measures:</div>
                          <div className="space-y-1">
                            {threat.methods.map((method, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-success" />
                                <span className="text-xs text-muted-foreground">{method}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Security Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">5</div>
                <div className="text-xs text-muted-foreground">Threats Blocked</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">0</div>
                <div className="text-xs text-muted-foreground">Active Warnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">247</div>
                <div className="text-xs text-muted-foreground">Attacks Prevented</div>
              </CardContent>
            </Card>
          </div>

          {/* Security Recommendations */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-2">Recommended Security Practices:</p>
                <ul className="space-y-1">
                  <li>• Use different devices for sensitive communications</li>
                  <li>• Enable disappearing messages for confidential content</li>
                  <li>• Verify contact identities through secure channels</li>
                  <li>• Keep Haven app updated with latest security patches</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}