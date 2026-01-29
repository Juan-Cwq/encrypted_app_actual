import { supabase } from '../supabase'

const NOTIF_KEY = 'haven_notifications'

function getNotifsLocal(username) {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[username] || []
  } catch {
    return []
  }
}

function setNotifsLocal(username, notifs) {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[username] = notifs
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all))
  } catch {}
}

export async function getNotifications(username) {
  if (!username) return []

  if (supabase) {
    const { data, error } = await supabase
      .from('haven_notifications')
      .select('id, message, read, created_at')
      .eq('user_username', username)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return []
    return (data || []).map((r) => ({
      id: r.id,
      message: r.message,
      read: !!r.read,
      createdAt: r.created_at,
    }))
  }

  return getNotifsLocal(username)
}

export async function addNotification(username, message) {
  const u = (username || '').trim()
  const m = (message || '').trim()
  if (!u || !m) return

  if (supabase) {
    await supabase.from('haven_notifications').insert({
      user_username: u,
      message: m,
    })
    return
  }

  const list = getNotifsLocal(u)
  list.unshift({ id: Date.now().toString(), message: m, read: false, createdAt: new Date().toISOString() })
  setNotifsLocal(u, list)
}

export async function markNotificationRead(username, notificationId) {
  if (!username) return

  if (supabase) {
    await supabase
      .from('haven_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_username', username)
    return
  }

  const list = getNotifsLocal(username).map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  )
  setNotifsLocal(username, list)
}

export async function markAllNotificationsRead(username) {
  if (!username) return

  if (supabase) {
    await supabase
      .from('haven_notifications')
      .update({ read: true })
      .eq('user_username', username)
    return
  }

  const list = getNotifsLocal(username).map((n) => ({ ...n, read: true }))
  setNotifsLocal(username, list)
}

export function unreadCount(notifications) {
  return (notifications || []).filter((n) => !n.read).length
}
