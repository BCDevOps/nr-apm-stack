import { OsDocument } from '../types/os-document';
import { RemoveMetadataParser } from './remove-metadata.parser';

describe('RemoveMetadataParser', () => {
  it('matches documents with metadata', () => {
    const rmMetaData = new RemoveMetadataParser();

    expect(
      rmMetaData.matches({
        data: { '@metadata': {} },
      } as unknown as OsDocument),
    ).toBe(true);
    expect(
      rmMetaData.matches({ data: { bob: {} } } as unknown as OsDocument),
    ).toBe(false);
  });

  it('apply removes metadata from documents', () => {
    const rmMetaData = new RemoveMetadataParser();
    const test = {
      data: { bob: '', '@metadata': {} },
    } as unknown as OsDocument;

    rmMetaData.apply(test);
    expect(test.data).toStrictEqual({ bob: '' });
  });
});
