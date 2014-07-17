describe('XMLHttpRequest', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;
  var XHR = apiRequestPromise;
  function valueFn(value) { return value; }

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.inboxapp.co/'
    });
  });


  afterEach(function() {
    server.restore();
    if (haveOwnPromise) {
      window.Promise = mockPromises.getOriginalPromise();
    } else {
      delete window.Promise;
    }
  });

  it('should call xhr.setRequestHeader with configured headers matching pattern', function() {
    var fulfilled = jasmine.createSpy('load');
    inbox.setRequestHeader('test-header', 'test-value');
    spyOn(sinon.FakeXMLHttpRequest.prototype, 'setRequestHeader').andCallThrough();
    var promise = XHR(inbox, 'get', 'http://api.inboxapp.co/', valueFn).then(fulfilled);
    expect(sinon.FakeXMLHttpRequest.prototype.setRequestHeader).
      toHaveBeenCalledWith('test-header', 'test-value');
    server.respond([200, { "Content-Type": "application/json" }, "{}"]);
    mockPromises.executeForPromise(promise);
    expect(fulfilled).toHaveBeenCalled();
  });


  it('should not call xhr.setRequestHeader with badly named headers', function() {
    var fulfilled = jasmine.createSpy('load');
    var headers = inbox.http().headers = {};
    headers['[test header]'] = 'test-value';
    spyOn(sinon.FakeXMLHttpRequest.prototype, 'setRequestHeader').andCallThrough();
    var promise = XHR(inbox, 'get', 'http://api.inboxapp.co/', valueFn).then(fulfilled);
    server.respond([200, { "Content-Type": "application/json" }, "{}"]);
    mockPromises.executeForPromise(promise);
    expect(fulfilled).toHaveBeenCalled();
    expect(sinon.FakeXMLHttpRequest.prototype.setRequestHeader).not.toHaveBeenCalled();
  });


  it('should set withCredentials with boolean value of httpConfig.withCredentials', function() {
    var fulfilled = jasmine.createSpy('load');
    var send = sinon.FakeXMLHttpRequest.prototype.send;
    spyOn(sinon.FakeXMLHttpRequest.prototype, 'send').andCallFake(function() {
      expect(this.withCredentials).toBe(true);
      send.apply(this, Array.prototype.slice.call(arguments, 0));
    });
    inbox.http('withCredentials', {});
    var promise = XHR(inbox, 'get', 'http://api.inboxapp.co/', valueFn).then(fulfilled);    
    server.respond([200, { "Content-Type": "application/json" }, "{}"]);
    mockPromises.executeForPromise(promise);
    expect(fulfilled).toHaveBeenCalled();
    expect(sinon.FakeXMLHttpRequest.prototype.send).toHaveBeenCalled();
  });
});