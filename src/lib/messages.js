import { supabase } from '../supabase'
import { encryptMessage, decryptMessage, loadPrivateKey } from './crypto'
import { getPublicKey, getSession, getSessionPassword } from './auth'

const MESSAGES_KEY = 'haven_messages'
const CHAT_SETTINGS_KEY = 'haven_chat_settings'

// Cache for decrypted messages (in-memory only, cleared on page reload)
const decryptedCache = new Map()

// Get messages from localStorage
function getMessagesLocal() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Save messages to localStorage
function setMessagesLocal(messages) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  } catch {}
}

// Get chat settings from localStorage
function getChatSettingsLocal() {
  try {
    const raw = localStorage.getItem(CHAT_SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Save chat settings to localStorage
function setChatSettingsLocal(settings) {
  try {
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(settings))
  } catch {}
}

// Generate a unique chat ID from two usernames (sorted alphabetically)
export function getChatId(user1, user2) {
  return [user1, user2].sort().join('__')
}

// Decrypt a single message
async function decryptMessageContent(msg, currentUser) {
  // Check cache first
  if (decryptedCache.has(msg.id)) {
    return decryptedCache.get(msg.id)
  }

  // If message is not encrypted (legacy or plain text), return as-is
  if (!msg.encrypted || !msg.encryptedKey || !msg.iv) {
    return msg.content
  }

  // Only decrypt messages sent TO the current user
  if (msg.to !== currentUser) {
    // For messages we sent, we stored the plain content locally
    return msg.content
  }

  try {
    const session = getSession()
    const password = getSessionPassword()
    if (!session || !password) {
      return '[Unable to decrypt - not signed in]'
    }

    const keyResult = await loadPrivateKey(session.username, password)
    if (!keyResult.success) {
      return '[Unable to decrypt - key error]'
    }

    const result = await decryptMessage(
      {
        encryptedMessage: msg.content,
        encryptedKey: msg.encryptedKey,
        iv: msg.iv,
      },
      keyResult.privateKey
    )

    if (result.success) {
      // Cache the decrypted content
      decryptedCache.set(msg.id, result.message)
      return result.message
    }

    return '[Decryption failed]'
  } catch (error) {
    console.error('Error decrypting message:', error)
    return '[Decryption error]'
  }
}

// Get messages for a chat
export async function getMessages(user1, user2) {
  const chatId = getChatId(user1, user2)
  const session = getSession()
  const currentUser = session?.username
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('haven_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Supabase getMessages error:', error)
        return getMessagesLocal()[chatId] || []
      }
      
      // Filter out expired messages
      const settings = await getChatSettings(user1, user2)
      const now = Date.now()
      const validMessages = (data || []).filter((msg) => {
        if (!settings.disappearingEnabled || settings.disappearingDays === 0) return true
        const msgTime = new Date(msg.created_at).getTime()
        const expiresAt = msgTime + settings.disappearingDays * 24 * 60 * 60 * 1000
        return now < expiresAt
      })
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        validMessages.map(async (m) => {
          const msgObj = {
            id: m.id,
            chatId: m.chat_id,
            from: m.from_username,
            to: m.to_username,
            content: m.content,
            encrypted: m.encrypted,
            encryptedKey: m.encrypted_key,
            iv: m.iv,
            type: m.message_type || 'text',
            fileName: m.file_name,
            fileUrl: m.file_url,
            createdAt: m.created_at,
            read: m.read,
          }
          
          // Decrypt if encrypted
          if (m.encrypted && currentUser) {
            msgObj.content = await decryptMessageContent(msgObj, currentUser)
          }
          
          return msgObj
        })
      )
      
      return decryptedMessages
    } catch (err) {
      console.error('Supabase getMessages exception:', err)
      return getMessagesLocal()[chatId] || []
    }
  }

  const allMessages = getMessagesLocal()
  const chatMessages = allMessages[chatId] || []
  
  // Filter out expired messages
  const settings = await getChatSettings(user1, user2)
  const now = Date.now()
  
  const validMessages = chatMessages.filter((msg) => {
    if (!settings.disappearingEnabled || settings.disappearingDays === 0) return true
    const msgTime = new Date(msg.createdAt).getTime()
    const expiresAt = msgTime + settings.disappearingDays * 24 * 60 * 60 * 1000
    return now < expiresAt
  })

  // Decrypt messages
  const decryptedMessages = await Promise.all(
    validMessages.map(async (msg) => {
      if (msg.encrypted && currentUser) {
        const decryptedContent = await decryptMessageContent(msg, currentUser)
        return { ...msg, content: decryptedContent }
      }
      return msg
    })
  )

  return decryptedMessages
}

// Send a message (with E2E encryption)
export async function sendMessage(from, to, content, type = 'text', fileName = null, fileUrl = null) {
  const chatId = getChatId(from, to)
  const now = new Date().toISOString()
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Try to encrypt the message
  let encryptedData = null
  let isEncrypted = false
  
  try {
    // Get recipient's public key
    const recipientPublicKey = await getPublicKey(to)
    
    if (recipientPublicKey && type === 'text') {
      // Encrypt the message
      const encryptResult = await encryptMessage(content, recipientPublicKey)
      
      if (encryptResult.success) {
        encryptedData = encryptResult
        isEncrypted = true
      }
    }
  } catch (error) {
    console.error('Encryption error (falling back to plain text):', error)
  }

  // Message object for local display (always show plain text to sender)
  const message = {
    id,
    chatId,
    from,
    to,
    content, // Plain text for sender's view
    encrypted: isEncrypted,
    encryptedKey: encryptedData?.encryptedKey || null,
    iv: encryptedData?.iv || null,
    type,
    fileName,
    fileUrl,
    createdAt: now,
    read: false,
  }

  // Message object for storage (encrypted content if available)
  const storageContent = isEncrypted ? encryptedData.encryptedMessage : content

  if (supabase) {
    try {
      const { error } = await supabase.from('haven_messages').insert({
        id,
        chat_id: chatId,
        from_username: from,
        to_username: to,
        content: storageContent,
        encrypted: isEncrypted,
        encrypted_key: encryptedData?.encryptedKey || null,
        iv: encryptedData?.iv || null,
        message_type: type,
        file_name: fileName,
        file_url: fileUrl,
        created_at: now,
        read: false,
      })
      
      if (error) {
        console.error('Supabase sendMessage error:', error)
        // Fall back to localStorage
        const allMessages = getMessagesLocal()
        if (!allMessages[chatId]) allMessages[chatId] = []
        allMessages[chatId].push({ ...message, content: storageContent })
        setMessagesLocal(allMessages)
      }
    } catch (err) {
      console.error('Supabase sendMessage exception:', err)
      const allMessages = getMessagesLocal()
      if (!allMessages[chatId]) allMessages[chatId] = []
      allMessages[chatId].push({ ...message, content: storageContent })
      setMessagesLocal(allMessages)
    }
  } else {
    const allMessages = getMessagesLocal()
    if (!allMessages[chatId]) allMessages[chatId] = []
    // Store encrypted content, but keep plain content for sender's immediate view
    const storageMessage = { ...message, content: storageContent }
    allMessages[chatId].push(storageMessage)
    setMessagesLocal(allMessages)
  }

  // Return message with plain text content for immediate display
  return message
}

// Mark messages as read
export async function markMessagesAsRead(user1, user2, currentUser) {
  const chatId = getChatId(user1, user2)

  if (supabase) {
    try {
      await supabase
        .from('haven_messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .eq('to_username', currentUser)
        .eq('read', false)
    } catch (err) {
      console.error('Supabase markMessagesAsRead exception:', err)
    }
  } else {
    const allMessages = getMessagesLocal()
    const chatMessages = allMessages[chatId] || []
    chatMessages.forEach((msg) => {
      if (msg.to === currentUser && !msg.read) {
        msg.read = true
      }
    })
    setMessagesLocal(allMessages)
  }
}

// Clear all messages in a chat
export async function clearChat(user1, user2) {
  const chatId = getChatId(user1, user2)

  if (supabase) {
    try {
      await supabase.from('haven_messages').delete().eq('chat_id', chatId)
    } catch (err) {
      console.error('Supabase clearChat exception:', err)
    }
  }

  const allMessages = getMessagesLocal()
  allMessages[chatId] = []
  setMessagesLocal(allMessages)
}

// Delete a chat entirely (including settings)
export async function deleteChat(user1, user2) {
  const chatId = getChatId(user1, user2)

  if (supabase) {
    try {
      await supabase.from('haven_messages').delete().eq('chat_id', chatId)
      await supabase.from('haven_chat_settings').delete().eq('chat_id', chatId)
    } catch (err) {
      console.error('Supabase deleteChat exception:', err)
    }
  }

  const allMessages = getMessagesLocal()
  delete allMessages[chatId]
  setMessagesLocal(allMessages)

  const allSettings = getChatSettingsLocal()
  delete allSettings[chatId]
  setChatSettingsLocal(allSettings)
}

// Get chat settings (disappearing messages, etc.)
export async function getChatSettings(user1, user2) {
  const chatId = getChatId(user1, user2)
  const defaultSettings = {
    disappearingEnabled: true,
    disappearingDays: 2,
    muted: false,
    blocked: false,
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('haven_chat_settings')
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle()

      if (error || !data) {
        const localSettings = getChatSettingsLocal()[chatId]
        return localSettings || defaultSettings
      }

      return {
        disappearingEnabled: data.disappearing_enabled ?? true,
        disappearingDays: data.disappearing_days ?? 2,
        muted: data.muted ?? false,
        blocked: data.blocked ?? false,
      }
    } catch (err) {
      console.error('Supabase getChatSettings exception:', err)
      const localSettings = getChatSettingsLocal()[chatId]
      return localSettings || defaultSettings
    }
  }

  const allSettings = getChatSettingsLocal()
  return allSettings[chatId] || defaultSettings
}

// Update chat settings
export async function updateChatSettings(user1, user2, settings) {
  const chatId = getChatId(user1, user2)

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('haven_chat_settings')
        .select('id')
        .eq('chat_id', chatId)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('haven_chat_settings')
          .update({
            disappearing_enabled: settings.disappearingEnabled,
            disappearing_days: settings.disappearingDays,
            muted: settings.muted,
            blocked: settings.blocked,
          })
          .eq('chat_id', chatId)
      } else {
        await supabase.from('haven_chat_settings').insert({
          chat_id: chatId,
          disappearing_enabled: settings.disappearingEnabled,
          disappearing_days: settings.disappearingDays,
          muted: settings.muted,
          blocked: settings.blocked,
        })
      }
    } catch (err) {
      console.error('Supabase updateChatSettings exception:', err)
    }
  }

  const allSettings = getChatSettingsLocal()
  allSettings[chatId] = settings
  setChatSettingsLocal(allSettings)
}

// Get unread message count for a chat
export async function getUnreadCount(user1, user2, currentUser) {
  const messages = await getMessages(user1, user2)
  return messages.filter((msg) => msg.to === currentUser && !msg.read).length
}
