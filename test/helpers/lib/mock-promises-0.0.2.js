(function() {
  var exports = Function('return this')() || (1, eval)('this');

  var extend = function(destination, source) {
    for(var property in source) {
      destination[property] = source[property];
    }
    return destination;
  };

  var each = function(array, handler) {
    for(var i = 0; i < array.length; i++) {
      handler(array[i], i);
    }
  };

  var MockPromise, OriginalPromise, originalThen;

  var MockPromises = function() {
    var contractsTracker = new ContractsTracker();

    this.install = function(ExternalPromiseClass) {
      MockPromise = ExternalPromiseClass;
      if(MockPromise.prototype.then !== fakeThen) {
        originalThen = MockPromise.prototype.then;
      }
      MockPromise.prototype.then = fakeThen;
    };

    this.uninstall = function() {
      if(MockPromise && originalThen) {
        MockPromise.prototype.then = originalThen;
      }
      if(OriginalPromise) {
        MockPromise = OriginalPromise;
        OriginalPromise = null;
      }
    };

    this.getMockPromise = function(ExternalPromiseClass) {
      if(!OriginalPromise) {
        OriginalPromise = ExternalPromiseClass;
      }

      function MockPromise(){
        return this.initialize.apply(this, arguments);
      }

      MockPromise.resolve = function(value) {
        return new MockPromise(function(resolve) {
          resolve(value);
        });
      };

      MockPromise.reject = function(reason) {
        return new MockPromise(function(resolve, reject) {
          reject(reason);
        });
      };

      MockPromise.all = function(promises) {
        var responses = [];
        var responded = 0;
        var numPromises = promises.length;
        var allResolve;
        var allReject;
        var allPromise = new MockPromise(function(resolve, reject){
          allResolve = resolve;
          allReject = reject;
        });
        each(promises, function(promise, index) {
          promise.then(function(value) {
            responses[index] = value;
            responded++;
            if(responded === numPromises) {
              allResolve(responses);
            }
          });
          promise.catch(function(reason) {
            allReject(reason);
          });
        });
        return allPromise;
      };

      MockPromise.prototype.inspect = function() {
        return {value: self.resolvedValue, reason: self.rejectedValue};
      };

      MockPromise.prototype.initialize = function(outerCallback) {
        var self = this;

        var promise = new OriginalPromise(function(resolve, reject) {
          outerCallback(
            function(value) {
              self.resolvedValue = value;
              self.fulfilled = true;
              resolve(value);
            },
            function(value) {
              self.rejectedValue = value;
              self.rejected = true;
              reject(value);
            }
          );
        });

        promise.inspect = function() {
          return {value: self.resolvedValue, reason: self.rejectedValue};
        };
        promise.isFulfilled = function() {
          return self.fulfilled;
        };
        promise.isRejected = function() {
          return self.rejected;
        };
        promise.then = fakeThen;

        promise.catch = function(errorHandler) {
          return promise.then(function() {
          }, errorHandler);
        };

        return promise;
      };

      return MockPromise;
    };

    this.getOriginalPromise = function() {
      return OriginalPromise;
    };

    var fakeThen = function() {
      var promise = this;
      contractsTracker.add({
        promise: promise,
        fulfilledHandler: arguments[0],
        errorHandler: arguments[1],
        progressHandler: arguments[2]
      });
      return promise;
    };

    this.executeForPromise = function(promise) {
      return contractsTracker.executeForPromise(promise);
    };
    this.executeForPromises = function(promises) {
      return contractsTracker.executeForPromises(promises);
    };
    this.valueForPromise = function(promise) {
      return contractsTracker.valueForPromise(promise);
    };
    this.executeForResolvedPromises = function() {
      return contractsTracker.executeForResolvedPromises();
    };
    this.reset = function() {
      return contractsTracker.reset();
    };

    this.contracts = contractsTracker;
  };

  var Contract = function(options) {
    this.id = options.id;
    this.promise = options.promise;
    this.fulfilledHandler = options.fulfilledHandler;
    this.errorHandler = options.errorHandler;
    this.progressHandler = options.progressHandler;
  };

  extend(Contract.prototype, {
    execute: function() {
      if(!this._executed) {
        this._executed = true;
        if(this.promise.isFulfilled()) {
          this.fulfilledHandler.call(this.promise, this.promise.inspect().value);
        } else if(this.promise.isRejected()) {
          this.errorHandler.call(this.promise, this.promise.inspect().reason);
        } else {
          throw new Error("this promise is not resolved and should not be executed");
        }

      }
    }
  });

  var ContractsTracker = function() {
    var contracts = [];
    var id = 0;
    this.reset = function() {
      contracts = [];
    };

    this.add = function(options) {
      options.id = id;
      id++;
      contracts.push(new Contract(options));
    };

    this.all = function() {
      return contracts;
    };

    this.filter = function(testFunction) {
      var filteredContracts = [];
      each(this.all(), function(contract) {
        if(testFunction(contract)) {
          filteredContracts.push(contract);
        }
      });
      return filteredContracts;
    };

    this.forPromise = function(promise) {
      return this.filter(function(contract) {
        return contract.promise === promise;
      });
    };

    this.executeForPromise = function(promise) {
      each(this.forPromise(promise), function(contract) {
        contract.execute();
      });
    };

    this.executeForPromises = function(promises) {
      var self = this;
      each(promises, function(promise) {
        self.executeForPromise(promise);
      });
    };

    this.valueForPromise = function(promise) {
      return promise.inspect().value;
    };

    this.executeForResolvedPromises = function() {
      var resolvedContracts = this.filter(function(contract) {
        return contract.promise.isFulfilled();
      });
      each(resolvedContracts, function(contract) {
        contract.execute();
      });
    };
  };

  exports.mockPromises = new MockPromises();
  return exports.mockPromises;
}).call(this);
