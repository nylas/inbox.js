ddescribe('URLAddFilters', function() {
  it('should not remove query parameters already in url', function() {
    var anchor = document.createElement('a');
    anchor.href = URLAddFilters('http://api.inboxapp.co/n/fake_namespace_id/threads?foo=bar', {
      subject: 'Hello!'
    });
    console.log(anchor.href);
  });
});
