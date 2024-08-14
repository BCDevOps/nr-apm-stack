import { renameField } from './rename-field';

describe('RenameField', () => {
  it('renames value fields', () => {
    const data = { hi: 'world' };
    renameField(data, 'hi', 'bye');
    expect(data).toEqual({
      bye: 'world',
    });
  });

  it('renames object fields', () => {
    const data = { hi: { quebec: 'bonjour', britain: ['hello', "'ello"] } };
    renameField(data, 'hi.britain', 'hi.england');
    expect(data).toEqual({
      hi: { quebec: 'bonjour', england: ['hello', "'ello"] },
    });
  });
});
