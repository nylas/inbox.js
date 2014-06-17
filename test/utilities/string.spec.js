describe('StringFormat', function() {
  it('should replace `%@` with Object.toString()-ified parameter', function() {
    expect(StringFormat('%@/%@/%@', 'foo', 123, null)).toBe('foo/123/null');
  });


  it('should replace `%@` markers with the empty string when no parameters remain', function() {
    expect(StringFormat('%@.%@jpeg', 'test')).toBe('test.jpeg');
  });
});
