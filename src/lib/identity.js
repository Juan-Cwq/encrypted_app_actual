/**
 * Convert a pseudo email to a username
 * @param {string} email - The email or pseudo email
 * @returns {string} - The extracted username
 */
export const pseudoEmailToUsername = (email) => {
  if (!email) return 'Anonymous'
  
  // Extract the part before @ symbol
  const username = email.split('@')[0]
  
  // Clean up the username to make it more readable
  return username
    .replace(/[._-]/g, ' ') // Replace separators with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim()
}

/**
 * Generate a random anonymous username
 * @returns {string} - A random username
 */
export const generateAnonymousUsername = () => {
  const adjectives = ['Silent', 'Swift', 'Shadow', 'Cipher', 'Phantom', 'Ghost', 'Stealth', 'Mystic', 'Hidden', 'Secure']
  const nouns = ['Wolf', 'Eagle', 'Raven', 'Fox', 'Falcon', 'Tiger', 'Lion', 'Bear', 'Hawk', 'Shark']
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 9999)
  
  return `${adjective}${noun}${number}`
}

/**
 * Validate if a username is appropriate
 * @param {string} username - The username to validate
 * @returns {boolean} - Whether the username is valid
 */
export const isValidUsername = (username) => {
  if (!username || username.length < 3) return false
  if (username.length > 30) return false
  
  // Allow alphanumeric, underscores, hyphens
  const validPattern = /^[a-zA-Z0-9_-]+$/
  return validPattern.test(username)
}