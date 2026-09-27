import { DomainError } from '@domain/errors';
import { ConsoleLogger } from '@infrastructure/services';

const createSink = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

describe('ConsoleLogger', () => {
  it('prints only the configured level and above', () => {
    const sink = createSink();
    const logger = new ConsoleLogger('warn', sink);

    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');

    expect(sink.debug).not.toHaveBeenCalled();
    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.warn).toHaveBeenCalledWith('[Explora] w');
    expect(sink.error).toHaveBeenCalledWith('[Explora] e');
  });

  it('prints nothing when silent', () => {
    const sink = createSink();
    const logger = new ConsoleLogger('silent', sink);

    logger.error('e');

    expect(sink.error).not.toHaveBeenCalled();
  });

  it('turns errors in the context into readable objects', () => {
    const sink = createSink();
    const cause = new Error('socket closed');

    new ConsoleLogger('debug', sink).debug('Refresh failed', {
      attempt: 2,
      error: new DomainError('NETWORK', 'GET /activities failed', cause),
    });

    expect(sink.debug).toHaveBeenCalledWith('[Explora] Refresh failed', {
      attempt: 2,
      error: {
        name: 'DomainError',
        code: 'NETWORK',
        message: 'GET /activities failed',
        cause: { name: 'Error', message: 'socket closed' },
      },
    });
  });

  it('never throws, even when the console does', () => {
    const sink = createSink();
    sink.error.mockImplementation(() => {
      throw new Error('console broke');
    });

    expect(() => new ConsoleLogger('debug', sink).error('e')).not.toThrow();
  });
});
