/**
 * Kinvey.Store.Cached test suite.
 */
describe('Kinvey.Store.Cached', function() {
  // Create store.
  before(function() {
    this.store = new Kinvey.Store.Cached(COLLECTION_UNDER_TEST);
  });
  after(function(done) {
    Kinvey.getCurrentUser().destroy(callback(done));
  });

  // Kinvey.Store.Cached#aggregate
  describe('#aggregate', function() {
    // Create mock.
    before(function(done) {
      // Aggregation will be a simple count.
      var aggregation = this.aggregation = new Kinvey.Aggregation();
      var object = this.object = { _id: 'foo' };
      this.response = [ { count: 1} ];// Response to test against.

      // Make sure aggregation is cached.
      var store = this.store;
      store.save(object, callback(done, {
        success: function() { },
        complete: function() {
          store.aggregate(aggregation.toJSON(), callback(done, { success: function() { } }));
        }
      }));
    });
    after(function(done) {
      var aggregation = this.aggregation;
      var store = this.store;
      store.remove(this.object, callback(done, {
        success: function() { },
        complete: function() {
          // Make sure cached aggregation is removed as well.
          store.db.put('aggregate', aggregation.toJSON(), null, callback(done));
        }
      }));
    });

    // Test suite.
    it('performs an aggregation using policy NO_CACHE.', function(done) {
      var expected = this.response;
      this.store.aggregate(this.aggregation.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.NO_CACHE,
        success: function(response, info) {
          response.should.eql(expected);
          info.network.should.be['true'];
        }
      }));
    });
    it('performs an aggregation using policy CACHE_ONLY.', function(done) {
      var expected = this.response;
      this.store.aggregate(this.aggregation.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.CACHE_ONLY,
        success: function(response, info) {
          response.should.eql(expected);
          info.cached.should.be['true'];
        }
      }));
    });
    it('performs an aggregation using policy CACHE_FIRST.', function(done) {
      var expected = this.response;
      this.store.aggregate(this.aggregation.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.CACHE_FIRST,
        success: function(response, info) {
          response.should.eql(expected);
          info.cached.should.be['true'];
        }
      }));
    });
    it('performs an aggregation using policy NETWORK_FIRST.', function(done) {
      var expected = this.response;
      this.store.aggregate(this.aggregation.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.NETWORK_FIRST,
        success: function(response, info) {
          response.should.eql(expected);
          info.network.should.be['true'];
        }
      }));
    });
    it('performs an aggregation using policy BOTH.', function(done) {
      // We expect the success handler to be invoked twice.
      var expected = this.response;
      var pass = 0;

      this.store.aggregate(this.aggregation.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.BOTH,
        success: function(response, info) {
          response.should.eql(expected);

          // First pass is cached store, second is network store.
          if(1 === ++pass) {
            info.cached.should.be['true'];
          }
          else {
            info.network.should.be['true'];
          }
        }
      }));
    });
  });

  // Kinvey.Store.Cached#query
  describe('#query', function() {
    // Create mock.
    before(function(done) {
      this.object = { _id: 'id', foo: 'bar' };
      this.store.save(this.object, callback(done, { success: function() { } }));
    });
    after(function(done) {
      this.store.remove(this.object, callback(done, { success: function() { } }));
    });

    // Test suite.
    it('loads an object using policy NO_CACHE.', function(done) {
      var object = this.object;
      this.store.query(object._id, callback(done, {
        policy: Kinvey.Store.Cached.NO_CACHE,
        success: function(response, info) {
          response._id.should.equal(object._id);
          response.foo.should.equal('bar');
          info.network.should.be['true'];
        }
      }));
    });
    it('loads an object using policy CACHE_ONLY.', function(done) {
      var object = this.object;
      this.store.query(object._id, callback(done, {
        policy: Kinvey.Store.Cached.CACHE_ONLY,
        success: function(response, info) {
          response._id.should.equal(object._id);
          response.foo.should.equal('bar');
          info.cached.should.be['true'];
        }
      }));
    });
    it('loads an object using policy CACHE_FIRST.', function(done) {
      var object = this.object;
      this.store.query(object._id, callback(done, {
        policy: Kinvey.Store.Cached.CACHE_FIRST,
        success: function(response, info) {
          response._id.should.equal(object._id);
          response.foo.should.equal('bar');
          info.cached.should.be['true'];
        }
      }));
    });
    it('loads an inexistent object using policy CACHE_FIRST.', function(done) {
      var object = this.object;
      this.store.query('bar', callback(done, {
        policy: Kinvey.Store.Cached.CACHE_FIRST,
        success: function() {
          done(new Error('Success callback was invoked.'));
        },
        error: function(error, info) {
          error.error.should.eql(Kinvey.Error.ENTITY_NOT_FOUND);
          info.network.should.be['true'];
        }
      }));
    });
    it('loads an object using policy NETWORK_FIRST.', function(done) {
      var object = this.object;
      this.store.query(object._id, callback(done, {
        policy: Kinvey.Store.Cached.NETWORK_FIRST,
        success: function(response, info) {
          response._id.should.equal(object._id);
          response.foo.should.equal('bar');
          info.network.should.be['true'];
        }
      }));
    });
    it('loads an inexistent object using policy NETWORK_FIRST.', function(done) {
      var object = this.object;
      this.store.query('bar', callback(done, {
        policy: Kinvey.Store.Cached.NETWORK_FIRST,
        success: function() {
          done(new Error('Success callback was invoked.'));
        },
        error: function(error, info) {
          error.error.should.eql(Kinvey.Error.ENTITY_NOT_FOUND);
          info.cached.should.be['true'];
        }
      }));
    });
    it('loads an object using policy BOTH.', function(done) {
      // We expect the success handler to be invoked twice.
      var pass = 0;

      var object = this.object;
      this.store.query(object._id, callback(done, {
        policy: Kinvey.Store.Cached.BOTH,
        success: function(response, info) {
          response._id.should.equal(object._id);
          response.foo.should.equal('bar');

          // First pass is cached store, second is network store.
          if(1 === ++pass) {
            info.cached.should.be['true'];
          }
          else {
            info.network.should.be['true'];
          }
        }
      }));
    });
  });

  // Kinvey.Store.Cached#queryWithQuery
  describe('#queryWithQuery', function() {
    // Create mock.
    before(function(done) {
      var first = this.first = { _id: 'first', foo: true };
      var second = this.second = { _id: 'second', foo: false };
      var query = this.query = new Kinvey.Query();

      // Make sure query is in cached.
      var store = this.store;
      store.save(first, callback(done, {
        success: function() { },
        complete: function() {
          store.save(second, callback(done, {
            success: function() { },
            complete: function() {
              store.queryWithQuery(query.toJSON(), callback(done, { success: function() { } }));
            }
          }));
        }
      }));
    });
    after(function(done) {
      this.store.removeWithQuery(this.query.toJSON(), callback(done, { success: function() { } }));
    });

    // Test suite.
    it('queries the store using policy NO_CACHE', function(done) {
      this.store.queryWithQuery(this.query.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.NO_CACHE,
        success: function(response, info) {
          response.should.have.length(2);
          response[0]._id.should.equal('first');
          response[1]._id.should.equal('second');
          info.network.should.be['true'];
        }
      }));
    });
    it('queries the store using policy CACHE_ONLY', function(done) {
      this.store.queryWithQuery(this.query.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.CACHE_ONLY,
        success: function(response, info) {
          response.should.have.length(2);
          response[0]._id.should.equal('first');
          response[1]._id.should.equal('second');
          info.cached.should.be['true'];
        }
      }));
    });
    it('queries the store using policy CACHE_FIRST', function(done) {
      this.store.queryWithQuery(this.query.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.CACHE_FIRST,
        success: function(response, info) {
          response.should.have.length(2);
          response[0]._id.should.equal('first');
          response[1]._id.should.equal('second');
          info.cached.should.be['true'];
        }
      }));
    });
    it('queries the store using policy NETWORK_FIRST', function(done) {
      this.store.queryWithQuery(this.query.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.NETWORK_FIRST,
        success: function(response, info) {
          response.should.have.length(2);
          response[0]._id.should.equal('first');
          response[1]._id.should.equal('second');
          info.network.should.be['true'];
        }
      }));
    });
    it('queries the store using policy BOTH', function(done) {
      // We expect the success handler to be invoked twice.
      var pass = 0;

      this.store.queryWithQuery(this.query.toJSON(), callback(done, {
        policy: Kinvey.Store.Cached.BOTH,
        success: function(response, info) {
          response.should.have.length(2);
          response[0]._id.should.equal('first');
          response[1]._id.should.equal('second');

          // First pass is cached store, second is network store.
          if(1 === ++pass) {
            info.cached.should.be['true'];
          }
          else {
            info.network.should.be['true'];
          }
        }
      }));
    });
  });

  // Kinvey.Store.Cached#remove
  describe('#remove', function() {
    // Create mock.
    beforeEach(function(done) {
      this.object = { _id: 'foo', bar: true };
      this.store.save(this.object, callback(done, { success: function() { } }));
    });

    // Test suite.
    it('removes an object from both stores.', function(done) {
      var store = this.store;
      var object = this.object;
      store.remove(object, callback(done, {
        policy: Kinvey.Store.Cached.NETWORK_FIRST,
        success: function(_, info) {
          // Object should be removed from the network, and from cache in background.
          info.network.should.be['true'];
        },
        complete: function() {
          // Object is now persisted in cache, retrieve and test.
          store.query(object._id, callback(done, {
            policy: Kinvey.Store.Cached.CACHE_ONLY,
            success: function() {
              done(new Error('Success callback was invoked.'));
            },
            error: function(_, info) {
              info.cached.should.be['true'];
            }
          }));
        }
      }));
    });
  });

  // Kinvey.Store.Cached#removeWithQuery
  describe('#removeWithQuery', function() {
    // Create mock.
    beforeEach(function(done) {
      var query = this.query = new Kinvey.Query().on('bar').equal(true);
      var object = this.object = { _id: 'foo', bar: true };

      var store = this.store;
      store.save(this.object, callback(done, {
        success: function() { },
        complete: function() {
          store.queryWithQuery(query.toJSON(), callback(done, { success: function() { } }));
        }
      }));
    });

    // Test suite.
    it('resets a cached query.', function(done) {
      var store = this.store;
      var query = this.query;
      store.removeWithQuery(query.toJSON(), callback(done, {
        success: function(_, info) {
          info.network.should.be['true'];
        },
        complete: function() {
          store.queryWithQuery(query.toJSON(), callback(done, {
            policy: Kinvey.Store.Cached.CACHE_ONLY,
            success: function(_, info) {
              info.cached.should.be['true'];
            },
            error: function(error, info) {
              error.error.should.eql(Kinvey.Error.DATABASE_ERROR);
              info.cached.should.be['true'];
            }
          }));
        }
      }));
    });
  });

  // Kinvey.Store.Cached#save
  describe('#save', function() {
    // Create mock.
    beforeEach(function() {
      this.object = { _id: 'foo', bar: true };
    });
    afterEach(function(done) {
      this.store.remove(this.object, callback(done, { success: function() { } }));
    });

    // Test suite.
    it('saves an object to both stores.', function(done) {
      var savedObject;
      var store = this.store;
      var object = this.object;
      store.save(object, callback(done, {
        policy: Kinvey.Store.Cached.CACHE_FIRST,
        success: function(response, info) {
          // Object should be stored to network, and to cached in background.
          info.network.should.be['true'];

          // Save object, used for comparison later.
          savedObject = response;
        },
        complete: function() {
          // Object is now persisted in cache, retrieve and test.
          store.query(object._id, callback(done, {
            policy: Kinvey.Store.Cached.CACHE_ONLY,
            success: function(response, info) {
              response.should.eql(savedObject);
              info.cached.should.be['true'];
            }
          }));
        }
      }));
    });
  });

});