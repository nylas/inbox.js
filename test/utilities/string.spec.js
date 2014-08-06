describe('stringFormat', function() {
  it('should replace `%@` with Object.toString()-ified parameter', function() {
    expect(formatString('%@/%@/%@', 'foo', 123, null)).toBe('foo/123/null');
  });


  it('should replace `%@` markers with the empty string when no parameters remain', function() {
    expect(formatString('%@.%@jpeg', 'test')).toBe('test.jpeg');
  });
});


describe('capitalizeString', function() {
  it('should capitalize each word in the string separated by whitespace', function() {
    expect(capitalizeString('foo bar baz')).toBe('Foo Bar Baz');
    expect(capitalizeString('foo\tbar\tbaz')).toBe('Foo\tBar\tBaz');
  });
});
