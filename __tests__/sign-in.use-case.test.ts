import { signInUseCase } from '@core/use-cases';
import { DomainError } from '@domain/errors';

const setup = (online = true) => {
  const saveAccount = jest.fn();
  return { deps: { isOnline: () => online, saveAccount }, saveAccount };
};

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (e) {
    return e instanceof DomainError ? e.code : 'not-a-domain-error';
  }
  return undefined;
};

describe('signInUseCase', () => {
  it('stores a trimmed account and never the password', () => {
    const { deps, saveAccount } = setup();
    const account = signInUseCase(deps, {
      email: '  ana@example.com ',
      password: 'correct-horse',
      name: ' Ana ',
    });
    expect(account).toEqual({ email: 'ana@example.com', name: 'Ana' });
    expect(saveAccount).toHaveBeenCalledWith(account);
    expect(JSON.stringify(saveAccount.mock.calls)).not.toContain(
      'correct-horse',
    );
  });

  it('rejects when offline', () => {
    const { deps, saveAccount } = setup(false);
    expect(
      codeOf(() =>
        signInUseCase(deps, { email: 'a@b.co', password: '12345678' }),
      ),
    ).toBe('OFFLINE');
    expect(saveAccount).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', () => {
    const { deps } = setup();
    expect(
      codeOf(() =>
        signInUseCase(deps, { email: 'nope', password: '12345678' }),
      ),
    ).toBe('INVALID_EMAIL');
  });

  it('rejects a short password', () => {
    const { deps } = setup();
    expect(
      codeOf(() =>
        signInUseCase(deps, { email: 'a@b.co', password: '1234567' }),
      ),
    ).toBe('WEAK_PASSWORD');
  });
});
