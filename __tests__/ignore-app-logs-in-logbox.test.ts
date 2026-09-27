import { LogBox } from 'react-native';
import { ignoreAppLogsInLogBox } from '@config/logging';

describe('ignoreAppLogsInLogBox', () => {
  afterEach(() => jest.restoreAllMocks());

  it('hides [Explora] lines from LogBox in dev', () => {
    const ignoreLogs = jest
      .spyOn(LogBox, 'ignoreLogs')
      .mockImplementation(() => undefined);

    ignoreAppLogsInLogBox();

    expect(ignoreLogs).toHaveBeenCalledWith(['[Explora]']);
  });
});
