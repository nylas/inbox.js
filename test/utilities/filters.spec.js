describe('applyFilters', function() {
  var i, ii, spec;
  var regexpFilters = ['subject'];

  function parseQuery(str) {
    var query = {};
    var strs, i, ii, tuple;
    if (str && str.charAt(0) === '?') {
      str = str.slice(1);
      strs = str.split('&');
      for (i=0, ii=strs.length; i<ii; ++i) {
        tuple = strs[i].split('=');
        if (tuple && tuple.length === 2) {
          query[decodeURIComponent(tuple[0])] = decodeURIComponent(tuple[1]);
        }
      }
    }
    return query;
  }

  beforeEach(function() {
    spec = this;
    this.addMatchers({
      toBeQuery: function(expected) {
        expected = expected.replace(/\%\@/g, spec.replaced);
        return jasmine.Matchers.prototype.toBe.call(this, expected);
      }
    });
  });

  function setName(name) {
    return function() {
      this.replaced = null;
      this.replaced = FILTER_NAMES_OPTS[name];
      if (this.replaced === true) {
        this.replaced = name;
      }
    };
  }


  for (i=0, ii=regexpFilters.length; i<ii; ++i) {
    (function(name) {
      describe(name, function() {
        beforeEach(setName(name));

        function re(val) {
          var obj = {};
          obj[name] = val;
          return applyFilters(obj);
        }


        it('should accept RegExp', function() {
          expect(re(/^test message$/)).toBeQuery('?%@=%2F%5Etest+message%24%2F');
        });


        it('should accept String', function() {
          expect(re('test message')).toBeQuery('?%@=test+message');
        });


        it('should not serialize non-RegExp objects', function() {
          expect(re({foo: 'bar'})).toBeQuery('');
        });


        it('should serialize result of functions', function() {
          expect(re(function() { return 'hello'; })).toBeQuery('?%@=hello');
        });
      });
    })(regexpFilters[i]);
  }


  var stringFilters = ['email', 'from', 'to', 'cc', 'bcc', 'thread', 'tag', 'filename'];
  for (i=0, ii=stringFilters.length; i<ii; ++i) {
    (function(name) {
      describe(name, function() {
        beforeEach(setName(name));

        function str(txt) {
          var obj = {};
          obj[name] = txt;
          return applyFilters(obj);
        }


        it('should accept String', function() {
          expect(str('bitdiddler@inboxapp.com')).toBeQuery('?%@=bitdiddler%40inboxapp.com');
        });


        it('should accept Number', function() {
          expect(str(1)).toBeQuery('?%@=1');
          expect(str(Infinity)).toBeQuery('?%@=Infinity');
          expect(str(NaN)).toBeQuery('?%@=NaN');
        });


        it('should accept Boolean', function() {
          expect(str(true)).toBeQuery('?%@=true');
          expect(str(false)).toBeQuery('?%@=false');
        });


        it('should not serialize RegExp', function() {
          expect(str(/bitdiddler@inboxapp.com/)).toBeQuery('');
        });


        it('should not serialize objects', function() {
          expect(str({foo: 'bar'})).toBeQuery('');
        });


        it('should serialize result of functions', function() {
          expect(str(function() { return 'hello'; })).toBeQuery('?%@=hello');
        });
      });
    })(stringFilters[i]);
  }


  var timestampFilters = [
    'lastMessageBefore',
    'lastMessageAfter',
    'startedBefore',
    'startedAfter'
  ];
  for (i=0, ii=timestampFilters.length; i<ii; ++i) {
    (function(name) {
      describe(name, function() {
        beforeEach(setName(name));

        function ts(txt) {
          var obj = {};
          obj[name] = txt;
          return applyFilters(obj);
        }


        it('should accept numeric String', function() {
          expect(ts('12345678')).toBeQuery('?%@=12345678');
        });


        it('should accept ISO-8601 String', function() {
          expect(ts('2014-06-19')).toBeQuery('?%@=1403136000');
          expect(ts('2014-06-19T19:12:32+00:00')).toBeQuery('?%@=1403205152');
          expect(ts('2014-06-19T19:12:32Z')).toBeQuery('?%@=1403205152');
        });


        it('should accept Number', function() {
          expect(ts(1403205152)).toBeQuery('?%@=1403205152');
        });


        it('should NOT accept number NaN', function() {
          expect(ts(NaN)).toBe('');
          expect(ts(-NaN)).toBe('');
        });


        it('shoud NOT accept number Infinity', function() {
          expect(ts(Infinity)).toBe('');
          expect(ts(-Infinity)).toBe('');
        });


        it('should NOT accept Boolean', function() {
          expect(ts(true)).toBe('');
          expect(ts(false)).toBe('');
        });


        it('should NOT serialize RegExp', function() {
          expect(ts(/Monday, march 7th/)).toBeQuery('');
        });


        it('should NOT serialize objects', function() {
          expect(ts({date: 'Monday, march 7th'})).toBeQuery('');
        });


        it('should serialize Date', function() {
          var date = new Date(1403205152000);
          expect(ts(date)).toBeQuery('?%@=1403205152');
        });


        it('should serialize result of functions', function() {
          expect(ts(function() { return '1403205152'; })).toBeQuery('?%@=1403205152');
        });
      });
    })(timestampFilters[i]);
  }


  var integerFilters = ['limit', 'offset'];
  for (i=0, ii=integerFilters.length; i<ii; ++i) {
    (function(name) {
      describe(name, function() {
        beforeEach(setName(name));

        function int(txt) {
          var obj = {};
          obj[name] = txt;
          return applyFilters(obj);
        }


        it('should accept numeric String', function() {
          expect(int('12345678')).toBeQuery('?%@=12345678');
          expect(int('0xFFFF')).toBeQuery('?%@=65535');
        });


        it('should NOT accept non-integer String', function() {
          expect(int('2014-06-19')).toBeQuery('');
          expect(int('12345678.44')).toBeQuery('');

        });


        it('should accept Number', function() {
          expect(int(1403205152000)).toBeQuery('?%@=1403205152000');
        });


        it('should NOT accept number NaN', function() {
          expect(int(NaN)).toBe('');
          expect(int(-NaN)).toBe('');
        });


        it('shoud NOT accept number Infinity', function() {
          expect(int(Infinity)).toBe('');
          expect(int(-Infinity)).toBe('');
        });


        it('should NOT accept Boolean', function() {
          expect(int(true)).toBe('');
          expect(int(false)).toBe('');
        });


        it('should NOT serialize RegExp', function() {
          expect(int(/Monday, march 7th/)).toBeQuery('');
        });


        it('should NOT serialize objects', function() {
          expect(int({date: 'Monday, march 7th'})).toBeQuery('');
        });


        it('should not serialize Date', function() {
          var date = new Date(1403205152000);
          expect(int(date)).toBeQuery('');
        });


        it('should serialize result of functions', function() {
          expect(int(function() { return '1403205152000'; })).toBeQuery('?%@=1403205152000');
        });
      });
    })(integerFilters[i]);
  }


  it('should remove unknown filters', function() {
    expect(applyFilters({
      'NOT_A_REAL_FILTER': '1403205152000'
    })).toBe('');
  });


  it('should combine filters', function() {
    var date = new Date();
    var expectDate = ((date.getTime() / 1000) >>> 0);
    expect(parseQuery(applyFilters({
      subject: /^foo bar$/,
      lastMessageBefore: date,
      email: 'natasha@evilspy.com',
      from: 'boris@evilspy.com'
    }))).toContainObject({
      subject: '/^foo+bar$/',
      last_message_before: '' + expectDate,
      any_email: 'natasha@evilspy.com',
      from: 'boris@evilspy.com'
    });
  });
});
