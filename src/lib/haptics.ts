/**
 * Haptic feedback utility using the Vibration API.
 * Gracefully degrades to no-op on unsupported devices.
 */

function vibrate(pattern: number | number[]): void {
  try {
    if (navigator?.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently ignore — unsupported or denied
  }
}

/** Light tap — button press, tab switch */
export function hapticLight(): void {
  vibrate(10);
}

/** Medium tap — coin tap, card tap */
export function hapticMedium(): void {
  vibrate(20);
}

/** Heavy tap — coin landing in jar */
export function hapticHeavy(): void {
  vibrate([15, 30, 15]);
}

/** Celebratory pattern — task completion, reward redemption */
export function hapticSuccess(): void {
  vibrate([10, 50, 20, 50, 30]);
}
