import { getLocalStorage, setLocalStorage } from './localStorage';
import { sendToggleStop } from './snap';

/**
 * Get the user's preferred theme in local storage.
 * Will default to the browser's preferred theme if there is no value in local storage.
 *
 * @returns True if the theme is "dark" otherwise, false.
 */
export const getThemePreference = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const darkModeSystem = window?.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  const localStoragePreference = getLocalStorage('theme');
  const systemPreference = darkModeSystem ? 'dark' : 'light';
  const preference = localStoragePreference ?? systemPreference;

  if (!localStoragePreference) {
    setLocalStorage('theme', systemPreference);
  }

  return preference === 'dark';
};

export const getStopLossToggle = async () => {
  const currentState = await sendToggleStop();
  console.log(currentState)
  if("stop" in currentState && currentState["stop"] === true) {
    return true;
  }
  console.log('asd')
  return false;
};
