describe('formatUrl', function() {
  it('should replace `%@` with Object.toString()-ified parameter', function() {
    expect(formatUrl('%@/%@/%@', 'foo', 123, null)).toBe('foo/123/null');
  });


  it('should replace `%@` markers with the empty string when no parameters remain', function() {
    expect(formatUrl('%@.%@jpeg', 'test')).toBe('test.jpeg');
  });


  it('should remove leading forward slashes from parameters', function() {
    expect(formatUrl('%@/%@', 'http://api.inboxapp.co/', '//fakeNamespaceId')).
      toBe('http://api.inboxapp.co/fakeNamespaceId');
  });


  it('should remove trailing forward slashes from parameters', function() {
    expect(formatUrl('%@/%@/%@', 'http://api.inboxapp.co/', 'fakeNamespaceId/', 'foo//')).
      toBe('http://api.inboxapp.co/fakeNamespaceId/foo');
  });
});
