import {expandFileAttributesFromPath} from './expand-file-attributes-from-path';

test('expanded file path attributes', () => {
  const record = {log: {file: {path: '/some/path/to/a/file.txt'}}};
  expandFileAttributesFromPath(record.log.file.path, record.log.file);
  expect(record).toEqual({
    log: {
      file: {
        path: '/some/path/to/a/file.txt',
        directory: '/some/path/to/a',
        name: 'file.txt',
        extension: 'txt',
      },
    },
  });
});
