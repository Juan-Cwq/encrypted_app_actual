import { useState, useRef } from 'react'
import { Upload, FileText, Image, Film, X, Check, Shield, AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export default function SecureFileTransfer({ onFileUpload, onClose }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    processFiles(selectedFiles)
  }

  const processFiles = (fileList) => {
    const processedFiles = fileList.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      encrypted: false
    }))
    setFiles(prev => [...prev, ...processedFiles])
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.startsWith('video/')) return <Film className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    
    // Simulate encryption and upload process
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Simulate encryption process
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'encrypting' } : f
      ))
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ))
      }
      
      // Mark as encrypted and uploaded
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'completed', 
          encrypted: true,
          progress: 100 
        } : f
      ))
    }
    
    setUploading(false)
    
    // Call parent callback
    if (onFileUpload) {
      onFileUpload(files)
    }
    
    // Auto-close after successful upload
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure File Transfer</span>
              </CardTitle>
              <CardDescription>
                Files are encrypted end-to-end before transmission
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop files here or click to select
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <div className="text-muted-foreground">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        {file.encrypted && (
                          <Shield className="h-3 w-3 text-success" />
                        )}
                        {file.status === 'completed' ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : file.status === 'encrypting' ? (
                          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            disabled={uploading}
                            className="h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === 'encrypting' && (
                        <p className="text-xs text-primary">
                          Encrypting... {file.progress}%
                        </p>
                      )}
                      {file.status === 'completed' && (
                        <p className="text-xs text-success">
                          Encrypted & Uploaded
                        </p>
                      )}
                    </div>
                    {file.status === 'encrypting' && (
                      <div className="w-full bg-muted rounded-full h-1 mt-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Security Notice:</p>
              <p>Files are encrypted with AES-256 before leaving your device. Recipients must authenticate to decrypt.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={files.length === 0 || uploading}
            >
              {uploading ? 'Encrypting...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}