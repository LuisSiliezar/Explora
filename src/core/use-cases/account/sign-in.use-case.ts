import type { Account, Credentials } from '@domain/entities';
import { DomainError } from '@domain/errors';

interface Deps {
  isOnline: () => boolean;
  saveAccount: (account: Account) => void;
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Local-only sign in / sign up: validates, then stores the account on the device.
 * The password is validated and dropped, never persisted. A real backend would plug in here.
 */
export const signInUseCase = (
  { isOnline, saveAccount }: Deps,
  { email, password, name }: Credentials,
): Account => {
  if (!isOnline()) {
    throw new DomainError('OFFLINE', 'Signing in needs a connection');
  }
  const trimmedEmail = email.trim();
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    throw new DomainError('INVALID_EMAIL', 'Enter a valid email address');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new DomainError(
      'WEAK_PASSWORD',
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
  const account: Account = name?.trim()
    ? { email: trimmedEmail, name: name.trim() }
    : { email: trimmedEmail };
  saveAccount(account);
  return account;
};
