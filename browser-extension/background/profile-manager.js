import { get, set } from '../shared/storage.js';
import { PROFILE_DEFAULTS } from '../shared/constants.js';

export async function getProfile(origin) {
  const siteProfiles = (await get('siteProfiles')) || {};
  const settings = (await get('settings')) || { defaultProfile: 'moderate' };

  const level = siteProfiles[origin] || settings.defaultProfile;
  return {
    level,
    ...PROFILE_DEFAULTS[level]
  };
}

export async function setProfile(origin, level) {
  const siteProfiles = (await get('siteProfiles')) || {};
  siteProfiles[origin] = level;
  await set('siteProfiles', siteProfiles);
}

export async function removeProfile(origin) {
  const siteProfiles = (await get('siteProfiles')) || {};
  delete siteProfiles[origin];
  await set('siteProfiles', siteProfiles);
}

export async function getAllProfiles() {
  return (await get('siteProfiles')) || {};
}

export async function isEnabled() {
  const settings = (await get('settings')) || {};
  return settings.enabled !== false;
}

export async function setEnabled(enabled) {
  const settings = (await get('settings')) || {};
  settings.enabled = enabled;
  await set('settings', settings);
}
