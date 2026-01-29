/**
 * Haven E2E Encryption Library
 * 
 * Uses Web Crypto API for:
 * - RSA-OAEP (2048-bit) for asymmetric encryption of session keys
 * - AES-GCM (256-bit) for symmetric encryption of messages
 * 
 * Flow:
 * 1. Each user has an RSA key pair (public + private)
 * 2. Public key is stored in database (shared with everyone)
 * 3. Private key is stored locally, encrypted with user's password
 * 4. To send a message:
 *    a. Generate random AES-256 key
 *    b. Encrypt message with AES key
 *    c. Encrypt AES key with recipient's public RSA key
 *    d. Send encrypted message + encrypted AES key
 * 5. To receive a message:
 *    a. Decrypt AES key with own private RSA key
 *    b. Decrypt message with AES key
 */

const PRIVATE_KEY_STORAGE = 'haven_private_key'
const PUBLIC_KEY_STORAGE = 'haven_public_key'
const KEY_SALT_STORAGE = 'haven_key_salt'

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate a random salt for key derivation
function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16))
}

// Derive an AES key from password using PBKDF2
async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Generate RSA key pair for a user
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )

  return keyPair
}

// Export public key to base64 string (for storage in database)
export async function exportPublicKey(publicKey) {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  return arrayBufferToBase64(exported)
}

// Import public key from base64 string
export async function importPublicKey(base64Key) {
  const keyData = base64ToArrayBuffer(base64Key)
  return crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  )
}

// Export private key to base64 string
async function exportPrivateKey(privateKey) {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey)
  return arrayBufferToBase64(exported)
}

// Import private key from base64 string
async function importPrivateKey(base64Key) {
  const keyData = base64ToArrayBuffer(base64Key)
  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  )
}

// Encrypt private key with password before storing
async function encryptPrivateKey(privateKeyBase64, password, salt) {
  const derivedKey = await deriveKeyFromPassword(password, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    encoder.encode(privateKeyBase64)
  )

  return {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encrypted),
  }
}

// Decrypt private key with password
async function decryptPrivateKey(encryptedData, password, salt) {
  const derivedKey = await deriveKeyFromPassword(password, salt)
  const iv = base64ToArrayBuffer(encryptedData.iv)
  const data = base64ToArrayBuffer(encryptedData.data)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    derivedKey,
    data
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

// Generate and store key pair for a new user
export async function createUserKeys(username, password) {
  try {
    const keyPair = await generateKeyPair()
    const publicKeyBase64 = await exportPublicKey(keyPair.publicKey)
    const privateKeyBase64 = await exportPrivateKey(keyPair.privateKey)

    // Generate salt for password-based encryption
    const salt = generateSalt()
    const saltBase64 = arrayBufferToBase64(salt)

    // Encrypt private key with password
    const encryptedPrivateKey = await encryptPrivateKey(privateKeyBase64, password, salt)

    // Store encrypted private key and salt locally
    const storageKey = `${PRIVATE_KEY_STORAGE}_${username}`
    const saltKey = `${KEY_SALT_STORAGE}_${username}`
    
    localStorage.setItem(storageKey, JSON.stringify(encryptedPrivateKey))
    localStorage.setItem(saltKey, saltBase64)
    localStorage.setItem(`${PUBLIC_KEY_STORAGE}_${username}`, publicKeyBase64)

    return {
      publicKey: publicKeyBase64,
      success: true,
    }
  } catch (error) {
    console.error('Error creating user keys:', error)
    return { success: false, error: error.message }
  }
}

// Load and decrypt user's private key
export async function loadPrivateKey(username, password) {
  try {
    const storageKey = `${PRIVATE_KEY_STORAGE}_${username}`
    const saltKey = `${KEY_SALT_STORAGE}_${username}`

    const encryptedData = localStorage.getItem(storageKey)
    const saltBase64 = localStorage.getItem(saltKey)

    if (!encryptedData || !saltBase64) {
      return { success: false, error: 'No keys found for user' }
    }

    const salt = base64ToArrayBuffer(saltBase64)
    const privateKeyBase64 = await decryptPrivateKey(
      JSON.parse(encryptedData),
      password,
      new Uint8Array(salt)
    )

    const privateKey = await importPrivateKey(privateKeyBase64)

    return { success: true, privateKey }
  } catch (error) {
    console.error('Error loading private key:', error)
    return { success: false, error: 'Failed to decrypt private key' }
  }
}

// Get user's public key from local storage
export function getLocalPublicKey(username) {
  return localStorage.getItem(`${PUBLIC_KEY_STORAGE}_${username}`)
}

// Generate a random AES-256 key for message encryption
async function generateMessageKey() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

// Encrypt a message for a recipient
export async function encryptMessage(message, recipientPublicKeyBase64) {
  try {
    // Import recipient's public key
    const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64)

    // Generate random AES key for this message
    const messageKey = await generateMessageKey()
    const exportedMessageKey = await crypto.subtle.exportKey('raw', messageKey)

    // Encrypt the message with AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoder = new TextEncoder()
    const encryptedMessage = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      messageKey,
      encoder.encode(message)
    )

    // Encrypt the AES key with recipient's RSA public key
    const encryptedKey = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      exportedMessageKey
    )

    return {
      success: true,
      encryptedMessage: arrayBufferToBase64(encryptedMessage),
      encryptedKey: arrayBufferToBase64(encryptedKey),
      iv: arrayBufferToBase64(iv),
    }
  } catch (error) {
    console.error('Error encrypting message:', error)
    return { success: false, error: error.message }
  }
}

// Decrypt a message using user's private key
export async function decryptMessage(encryptedData, privateKey) {
  try {
    const { encryptedMessage, encryptedKey, iv } = encryptedData

    // Decrypt the AES key with private RSA key
    const decryptedKeyBuffer = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      base64ToArrayBuffer(encryptedKey)
    )

    // Import the decrypted AES key
    const messageKey = await crypto.subtle.importKey(
      'raw',
      decryptedKeyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    // Decrypt the message
    const decryptedMessage = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(iv)) },
      messageKey,
      base64ToArrayBuffer(encryptedMessage)
    )

    const decoder = new TextDecoder()
    return {
      success: true,
      message: decoder.decode(decryptedMessage),
    }
  } catch (error) {
    console.error('Error decrypting message:', error)
    return { success: false, error: 'Failed to decrypt message' }
  }
}

// Export private key for backup (encrypted with recovery key)
export async function exportPrivateKeyForBackup(username, password, recoveryKey) {
  try {
    // First load the private key
    const result = await loadPrivateKey(username, password)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Export private key
    const privateKeyBase64 = await exportPrivateKey(result.privateKey)

    // Encrypt with recovery key
    const salt = generateSalt()
    const encryptedBackup = await encryptPrivateKey(privateKeyBase64, recoveryKey, salt)

    return {
      success: true,
      backup: {
        encryptedPrivateKey: encryptedBackup,
        salt: arrayBufferToBase64(salt),
        publicKey: getLocalPublicKey(username),
      },
    }
  } catch (error) {
    console.error('Error exporting private key for backup:', error)
    return { success: false, error: error.message }
  }
}

// Import private key from backup using recovery key
export async function importPrivateKeyFromBackup(username, newPassword, recoveryKey, backup) {
  try {
    // Decrypt private key using recovery key
    const salt = base64ToArrayBuffer(backup.salt)
    const privateKeyBase64 = await decryptPrivateKey(
      backup.encryptedPrivateKey,
      recoveryKey,
      new Uint8Array(salt)
    )

    // Re-encrypt with new password
    const newSalt = generateSalt()
    const encryptedPrivateKey = await encryptPrivateKey(privateKeyBase64, newPassword, newSalt)

    // Store locally
    const storageKey = `${PRIVATE_KEY_STORAGE}_${username}`
    const saltKey = `${KEY_SALT_STORAGE}_${username}`
    
    localStorage.setItem(storageKey, JSON.stringify(encryptedPrivateKey))
    localStorage.setItem(saltKey, arrayBufferToBase64(newSalt))
    localStorage.setItem(`${PUBLIC_KEY_STORAGE}_${username}`, backup.publicKey)

    return { success: true }
  } catch (error) {
    console.error('Error importing private key from backup:', error)
    return { success: false, error: 'Invalid recovery key or corrupted backup' }
  }
}

// Check if user has encryption keys
export function hasEncryptionKeys(username) {
  const storageKey = `${PRIVATE_KEY_STORAGE}_${username}`
  return localStorage.getItem(storageKey) !== null
}
