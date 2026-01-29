import { supabase } from '../supabase'

const ACCOUNTS_KEY = 'haven_accounts'
const RECOVERY_KEY = 'haven_recovery'
const SESSION_KEY = 'haven_session'

function getAccountsLocal() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function getRecoveryIndexLocal() {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function normalizeRecoveryKey(input) {
  let key = (input || '').trim()
  key = key.replace(/^recovery\s*key\s*:?\s*/i, '').trim()
  key = key.replace(/[\s\-_]+/g, '').toUpperCase()
  return key || ''
}

function formatRecoveryKeyForStorage(key) {
  const k = normalizeRecoveryKey(key)
  return k || (key || '').trim().toUpperCase()
}

export async function createAccount(username, password, recoveryKey) {
  const normalizedUsername = (username || '').trim()
  const key = formatRecoveryKeyForStorage(recoveryKey)
  if (!normalizedUsername || !password || !key) {
    return { success: false, error: 'Username, password, and recovery key required' }
  }

  if (supabase) {
    const { data: existing } = await supabase
      .from('haven_accounts')
      .select('username')
      .eq('username', normalizedUsername)
      .maybeSingle()
    if (existing) {
      return { success: false, error: 'Username already taken' }
    }
    const { error } = await supabase.from('haven_accounts').insert({
      username: normalizedUsername,
      password,
      recovery_key: key,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const accounts = getAccountsLocal()
  const recovery = getRecoveryIndexLocal()
  if (accounts[normalizedUsername]) return { success: false, error: 'Username already taken' }
  accounts[normalizedUsername] = { password, recoveryKey: key }
  recovery[key] = normalizedUsername
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  localStorage.setItem(RECOVERY_KEY, JSON.stringify(recovery))
  return { success: true }
}

export async function signIn(username, password) {
  const normalizedUsername = (username || '').trim()
  if (!normalizedUsername || !password) {
    return { success: false, error: 'Username or password may be incorrect' }
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('haven_accounts')
      .select('username, password')
      .eq('username', normalizedUsername)
      .maybeSingle()
    if (error) return { success: false, error: 'Username or password may be incorrect' }
    if (!data || data.password !== password) {
      return { success: false, error: 'Username or password may be incorrect' }
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: data.username }))
    return { success: true }
  }

  const accounts = getAccountsLocal()
  const account = accounts[normalizedUsername]
  if (!account || account.password !== password) {
    return { success: false, error: 'Username or password may be incorrect' }
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: normalizedUsername }))
  return { success: true }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function recoverByKey(recoveryKey) {
  const key = formatRecoveryKeyForStorage(recoveryKey)
  if (!key) return { success: false, error: 'Recovery key not found. Enter it exactly as saved.' }

  if (supabase) {
    const { data, error } = await supabase
      .from('haven_accounts')
      .select('username')
      .eq('recovery_key', key)
      .maybeSingle()
    if (error) return { success: false, error: 'Recovery key not found. Enter it exactly as saved.' }
    if (!data) return { success: false, error: 'Recovery key not found. Enter it exactly as saved.' }
    return { success: true, username: data.username }
  }

  const recovery = getRecoveryIndexLocal()
  const username = recovery[key]
  if (!username) return { success: false, error: 'Recovery key not found. Enter it exactly as saved.' }
  return { success: true, username }
}

export async function resetPasswordWithRecovery(recoveryKey, newPassword) {
  const key = formatRecoveryKeyForStorage(recoveryKey)
  if (!key) return { success: false, error: 'Recovery key not found.' }

  if (supabase) {
    const { data: account, error: fetchErr } = await supabase
      .from('haven_accounts')
      .select('username')
      .eq('recovery_key', key)
      .maybeSingle()
    if (fetchErr || !account) return { success: false, error: 'Recovery key not found.' }
    const { error: updateErr } = await supabase
      .from('haven_accounts')
      .update({ password: newPassword })
      .eq('recovery_key', key)
    if (updateErr) return { success: false, error: updateErr.message }
    return { success: true, username: account.username }
  }

  const recovery = getRecoveryIndexLocal()
  const accounts = getAccountsLocal()
  const username = recovery[key]
  if (!username || !accounts[username]) return { success: false, error: 'Recovery key not found.' }
  accounts[username].password = newPassword
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return { success: true, username }
}
