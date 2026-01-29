import { supabase } from '../supabase'

const CONTACTS_KEY = 'haven_contacts'

function getContactsLocal(username) {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[username] || []
  } catch {
    return []
  }
}

function setContactsLocal(username, contacts) {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[username] = contacts
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(all))
  } catch {}
}

function getLocalUsernames() {
  try {
    const raw = localStorage.getItem('haven_accounts')
    const accounts = raw ? JSON.parse(raw) : {}
    return Object.keys(accounts)
  } catch {
    return []
  }
}

export async function searchAccounts(query, excludeUsername) {
  const q = (query || '').trim()
  const exclude = (excludeUsername || '').trim()
  if (!q) return []

  const lower = q.toLowerCase()
  const matches = (usernames) =>
    usernames.filter((u) => u.toLowerCase().includes(lower) && u !== exclude).slice(0, 20)

  const fromLocal = matches(getLocalUsernames())

  if (!supabase) return fromLocal

  try {
    const { data, error } = await supabase
      .from('haven_accounts')
      .select('username')
      .ilike('username', `%${q}%`)
      .neq('username', exclude)
      .limit(20)
    const fromSupabase = error ? [] : (data || []).map((r) => r.username)

    const seen = new Set(fromLocal)
    for (const u of fromSupabase) {
      if (!seen.has(u)) seen.add(u)
    }
    return [...seen].slice(0, 20)
  } catch {
    return fromLocal
  }
}

export async function getContacts(username) {
  if (!username) return []

  if (supabase) {
    const { data, error } = await supabase
      .from('haven_contacts')
      .select('contact_username')
      .eq('user_username', username)
      .order('created_at', { ascending: false })
    if (error) return []
    return (data || []).map((r) => r.contact_username)
  }

  return getContactsLocal(username)
}

export async function addContact(userUsername, contactUsername) {
  const u = (userUsername || '').trim()
  const c = (contactUsername || '').trim()
  if (!u || !c || u === c) return { success: false, error: 'Invalid usernames' }

  if (supabase) {
    const { error } = await supabase.from('haven_contacts').insert({
      user_username: u,
      contact_username: c,
    })
    if (error) {
      if (error.code === '23505') return { success: false, error: 'Already added' }
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const list = getContactsLocal(u)
  if (list.includes(c)) return { success: false, error: 'Already added' }
  list.unshift(c)
  setContactsLocal(u, list)
  return { success: true }
}

export async function removeContact(userUsername, contactUsername) {
  const u = (userUsername || '').trim()
  const c = (contactUsername || '').trim()
  if (!u || !c) return { success: false }

  if (supabase) {
    await supabase
      .from('haven_contacts')
      .delete()
      .eq('user_username', u)
      .eq('contact_username', c)
    return { success: true }
  }

  const list = getContactsLocal(u).filter((x) => x !== c)
  setContactsLocal(u, list)
  return { success: true }
}
