import { DomainError } from '@domain/errors';
import { createActivityRepository } from './helpers/fakes';

describe('ActivityRepositoryImpl', () => {
  const repository = createActivityRepository();

  it('returns all activities from any ActivityDataSource', async () => {
    expect(await repository.getAll()).toHaveLength(12);
  });

  it('finds by id', async () => {
    expect((await repository.getById('act-007')).title).toBe(
      'Pottery Workshop',
    );
  });

  it('throws NOT_FOUND for unknown ids', async () => {
    await expect(repository.getById('nope')).rejects.toMatchObject<
      Partial<DomainError>
    >({ code: 'NOT_FOUND' });
  });
});
