import { BlobToUrlPipe } from './blob-to-url.pipe';

describe('BlobToUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new BlobToUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
