/**
 * @class INModelObject
 *
 * @description
 * Abstract base-class for all client-exposed models held by the Inbox api.
 */


function INModelObject(inbox, id, namespaceId) {
  var namespace = null;
  var data = null;

  if (namespaceId) {
    if (typeof namespaceId === 'object') {
      if (namespaceId instanceof INNamespace) {
        namespace = namespaceId;
        namespaceId = namespace.namespaceId;
      } else {
        namespace = new INNamespace(inbox, namespaceId, namespaceId);
      }
    }
  }

  if (inbox instanceof INNamespace) {
    namespace = inbox;
    inbox = namespace.inbox();
    if (namespaceId && (namespaceId != namespace.id))
      throw new TypeError('Two different namespace IDs provided to INModelObject constructor.');
    namespaceId = namespace.id;
  }

  if (id && typeof id === 'object') {
    data = id;
    this.id = data.id || '-selfdefined';
    if (data.namespace_id) {
      if (namespaceId && (namespaceId != data.namespace_id))
        throw new TypeError('You cannot instantiate an INModelObject with JSON from one namespace'+
                            'into another namespace.');
      namespaceId = data.namespace_id;
    }
    
  } else if (id) {
    this.id = id;
  } else {
    this.id = '-selfdefined';
  }

  this.namespaceId = namespaceId;

  defineProperty(this, '_', INVISIBLE, null, null, {
    inbox: inbox,
    namespace: namespace
  });

  if (data) this.update(data);
}


/**
 * @function
 * @name INModelObject#namespace
 *
 * @description
 * Returns either the namespace instance associated with the model object, or creates a new one
 * instead.
 *
 * This is currently somewhat problematic as it becomes possible to construct multiple instances
 * of an INNamespace model object representing the same object on the server, but with different
 * data.
 *
 * Because of these problems, it should primarily be used only for fetching data from the server.
 *
 * @returns {INNamespace} an INNamespace object to which this model object is associated.
 */
INModelObject.prototype.namespace = function() {
  if (this._.namespace) {
    return this._.namespace;
  } else if (this.namespaceId) {
    return (this._.namespace = getNamespace(this.inbox(), this.namespaceId));
  }
  return null;
};


/**
 * @function
 * @name INModelObject#baseUrl
 *
 * @description
 * Returns the base URL of the Inbox instance. This method is merely a wrapper for calling
 * modelObject.inbox().baseUrl().
 *
 * @returns {string} the base URL of the Inbox instance.
 */
INModelObject.prototype.baseUrl = function() {
  return this._.inbox.baseUrl();
};


/**
 * @function
 * @name INModelObject#namespaceUrl
 *
 * @description
 * Returns the namespace URL (<base URL>/n/<namespaceId>) for this model object.
 *
 * @returns {string} The namespace URL for this model object, relative to the base URL.
 */
INModelObject.prototype.namespaceUrl = function() {
  if (!this.namespaceId)
    throw new TypeError('INModelObject namespaceUrl() is undefined because the model has no namespace ID');
  return formatUrl('%@/n/%@', this._.inbox.baseUrl(), this.namespaceId);
};


/**
 * @function
 * @name INModelObject#resourceName
 *
 * @description
 * The URL component for this resource, used to build URLs with the collection name
 *
 * @returns {string} The URL for this model.
 */
INModelObject.prototype.resourceName = function() {
  throw new TypeError('INModelObject base class does not have a resourceName()');
};


/**
 * @function
 * @name INModelObject#resourceUrl
 *
 * @description
 * The URL for this resource. If the model is unsynced, return null.
 * Otherwise, it is the path of the specific resource instance.
 *
 * @returns {string} The URL for this model.
 */
INModelObject.prototype.resourceUrl = function() {
  if (this.isUnsynced())
    return null;
  return formatUrl('%@/%@/%@', this.namespaceUrl(), this.resourceName(), this.id);
};


/**
 * @function
 * @name INModelObject#isUnsynced
 *
 * @description
 * Returns true if the model object was created locally and has never been synced to the
 * server. Returns false if the model object was fetched from the server.
 *
 * @returns {boolean} true if the model ID ends with '-selfdefined', otherwise false.
 */
INModelObject.prototype.isUnsynced = function() {
  return endsWith(this.id, '-selfdefined');
};


/**
 * @function
 * @name INModelObject#reload
 *
 * @description
 * If the model object is synced to the server, data is fetched from the server and applied to the
 * model object, and the promise is fulfilled with this value. Otherwise, the promise is fulfilled
 * with the unsynced value immediately.
 *
 * @returns {Promise} a Promise to be fulfilled when fetching is complete. It will be fulfilled
 *   with either a successful response, an error response, or an internal error such as a network
 *   error.
 */
INModelObject.prototype.reload = function() {
  var self = this;
  return this.promise(function(resolve, reject) {
    reloadModel(self, function(err, data) {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};


function reloadModel(model, callback) {
  if (model.isUnsynced()) return callback(null, model);
  apiRequest(model.inbox(), 'get', model.resourceUrl(), function(err, data) {
    if (err) return callback(err, null);
    model.update(data);
    persistModel(model);
    callback(null, model);
  });
}


/**
 * @function
 * @name INModelObject#update
 *
 * @description
 * Each internal model object class has an associated ResourceMapping, which defines how properties
 * are merged in. update() should be passed an object which contains properties such as those from
 * the web service. Property names and types are converted based on the rules of the
 * ResourceMapping. Unknown properties are ignored.
 */
INModelObject.prototype.update = function(data) {
  if (!data) return;
  var mapping = this.resourceMapping;
  var updated = data['__converted_from_raw__'] || false;

  forEach(mapping, function copyMappedProperties(mappingInfo, propertyName) {
    var cast = mappingInfo.to;
    var merge = mappingInfo.merge;
    var jsonKey = mappingInfo.jsonKey;
    var cnst = mappingInfo.cnst;
    var currentValue;
    var isObject;
    var key = updated ? propertyName : jsonKey;


    if (hasProperty(data, key)) {
      if (cnst) {
        this[propertyName] = cnst;
      } else {
        currentValue = data[key];
        if (typeof currentValue !== 'undefined') {
          cast = cast(currentValue, mappingInfo);
          isObject = cast && typeof cast === 'object';
          if (!this[propertyName] || !isObject || !merge) {
            this[propertyName] = cast;
          } else {
            merge(this[propertyName], cast);
          }
        }
      }
    } else if (cnst) {
      this[propertyName] = cnst;
    }
  }, this);
};


/**
 * @function
 * @name INModelObject#raw
 *
 * @description
 * Helper for converting the model object into an object containing the mapped properties.
 *
 * @returns {object} an object containing the mapped properties for the model object.
 */
INModelObject.prototype.raw = function() {
  var mapping = this.resourceMapping;
  var out = {};
  forEach(mapping, function copyMappedProperties(mappingInfo, propertyName) {
    var cast = mappingInfo.from;
    var jsonKey = mappingInfo.jsonKey;
    var cnst = mappingInfo.cnst;
    var isObject;
    var currentValue;

    if (hasProperty(this, propertyName)) {
      if (cnst) {
        out[jsonKey] = cnst;
      } else {
        currentValue = this[propertyName];
        cast = cast(currentValue, mappingInfo);
        isObject = cast && typeof cast === 'object';
        if (typeof currentValue !== 'undefined') {
          if (!isObject || !cast) {
            out[jsonKey] = cast;
          } else {
            out[jsonKey] = merge(isArray(cast) ? [] : {}, cast);
          }
        }
      }
    } else if (cnst) {
      out[jsonKey] = cnst;
    }
  }, this);
  return out;
};


/**
 * @function
 * @name INModelObject#toJSON
 *
 * @description
 * Like INModelObject#raw(), except that instead of returning the raw object itself, it will
 * instead return the object converted to JSON.
 *
 * @returns {string} the JSON-stringified raw resource value.
 */
INModelObject.prototype.toJSON = function() {
  return this.raw();
};


var casters = {
  array: {
    to: function castToArray(val) {
      if (isArray(val)) return val;
      return fromArray(val);
    },
    from: function castFromArray(val) {
      return val;
    },
    merge: function mergeSimpleArrays(dest, src) {
      // Merge simple arrays
      if (!isArray(dest)) return merge([], src || []);
      else if (!isArray(src) || !src.length) dest.length = 0;
      else {
        dest.length = src.length;
        for (var i = 0, ii = src.length; i < ii; ++i) {
          dest[i] = src[i];
        }
      }
      return dest;
    }
  },
  date: {
    to: function castToDate(val) {
      var v;
      switch (typeof val) {
      case 'number': return new Date((val >>> 0) * 1000);
      case 'string': return new Date(val);
      case 'object':
        if (val === null) return null;
        if (val instanceof Date) return val;
        if ((typeof val.toDate === 'function') && (v = val.toDate()) instanceof Date) return v;
        /* falls through */
      default:
        return undefined;
      }
    },
    from: function castFromDate(val) {
      var v;
      switch (typeof val) {
      case 'number': return val >>> 0;
      case 'string': return new Date(val).getTime();
      case 'object':
        if (val === null) return null;
        if (val instanceof Date) return (val.getTime() / 1000);
        if (typeof val.valueOf === 'function' && typeof (v = val.valueOf()) === 'number') return v;
        /* falls through */
      default:
        return;
      }
    }
  },

  int: function castToInt(val) {
    return (val) >>> 0;
  },

  string: function castToString(val) {
    if (val === null) return null;
    return '' + val;
  },

  bool: function castToBool(val) {
    return !!val;
  },

  'const': function castToConst(val, info) {
    return info.cnst;
  }
};


/**
 * @function
 * @name defineResourceMapping
 * @private
 *
 * @description
 * Private method for associated a ResourceMapping with an INModelObject subclass.
 *
 * The mapping is an object where the key is the 'client-side' name for the property, which is
 * typically camel-cased. Sometimes, the name is changed from the original value to be more
 * semantically correct, and avoid shadowing method names (for instance,
 * `messages` -> `messageIDs`).
 *
 * The property value is somewhat more complicated, and takes several forms:
 * If the name contains a colon `:`, the left-hand side is a 'type' name, which corresponds to
 * a value in the casters dictionary above. Everything to the right of this first `:` is the JSON
 * property name (the name for the property in server requests and responses). However, if the
 * `type` is `const`, a second check for another `:` is performed on the remainder of the string.
 * If the second `:` is found, then the value to the left is the JSON key, and the value to the
 * right is the value. If a second `:` is not found, then the right-most field is the constant
 * value, and the JSON key is assumed to be the same as the property name.
 *
 * Because this is complicated, here's a chart:
 *
 * ----------------+---------------------+------------------+---------------------------------------
 *   propertyName  |  propertyValue      |  type            |  value / heuristics
 * ----------------+---------------------+------------------+---------------------------------------
 *   subject       |  subject            |  string (default)| json.subject becomes model.subject
 * ----------------+---------------------+------------------+---------------------------------------
 *   messageIDs    |  array:messages     |  array           | json.messages[] becomes
 *                 |                     |                  | model.messageIDs[]
 * ----------------+---------------------+------------------+---------------------------------------
 *   resourceType  |  const:object:draft |  const (string)  | model.resourceType === 'draft',
 *                 |                     |                  | json.object === 'draft'.
 * ----------------+---------------------+------------------+---------------------------------------
 *
 * There are several supported types to cast to, including 'date', 'bool', 'string', and 'array'.
 *
 * @param {function} resourceClass Constructor for the child class of INModelObject.
 * @param {object} mapping Resource mapping, see the description for details.
 * @param {base=} base Base-class, from which this resourceMapping should inherit. By default, this
 *   is INModelObject.
 */
function defineResourceMapping(resourceClass, mapping, base) {
  var jsonProperties = {};

  function resourceMapping() {
    var x;
    for (x in this) {
      if (x !== 'jsonKeys' && x !== 'resourceMapping') {
        this[x] = this[x];
      }
    }
  }

  if (!base && base !== null) {
    base = INModelObject;
  }

  if (base) {
    inherits(resourceMapping, base.resourceMapping.constructor);
  }

  forEach(mapping, function(mapping, propertyName) {
    if (typeof mapping === 'string') {
      var split = mapping.indexOf(':');
      var type = 'string';
      var jsonKey = mapping;
      var cnst = false;
      if (split >= 0) {
        type = mapping.substring(0, split);
        jsonKey = mapping.substring(split + 1);
        if (type === 'const') {
          cnst = jsonKey;
          if ((split = jsonKey.indexOf(':')) >= 0) {
            cnst = jsonKey.substring(split + 1);
            jsonKey = jsonKey.substring(0, split);
          } else {
            jsonKey = propertyName;
          }
        }
        if (!hasProperty(casters, type)) {
          type = 'string';
          jsonKey = mapping;
        }
      }

      var caster = casters[type];
      var from;
      var to;
      var merge = null;

      if (typeof caster === 'function') {
        from = to = caster;
      } else if (typeof caster === 'object') {
        from = caster.from;
        to = caster.to;
        merge = caster.merge || null;
      }

      jsonProperties[jsonKey] = propertyName;
      resourceMapping.prototype[propertyName] = {
        jsonKey: jsonKey,
        to: to,
        from: from,
        merge: merge,
        type: type,
        cnst: cnst
      };
    }
  });

  defineProperty(resourceMapping.prototype, 'jsonKeys', INVISIBLE, null, null, jsonProperties);
  resourceMapping = new resourceMapping();
  defineProperty(resourceClass, 'resourceMapping', INVISIBLE, null, null, resourceMapping);
  defineProperty(resourceClass.prototype, 'resourceMapping', INVISIBLE, null, null,
    resourceMapping);
}


function mappingForProperty(propertyName, resource) {
  if (propertyName === 'jsonKeys' || propertyName === 'resourceMapping') return;
  var mapping = resource && resource.resourceMapping;
  if (mapping) {
    if (mapping.hasOwnProperty(propertyName)) {
      return mapping[propertyName];
    } else if (mapping.jsonKeys.hasOwnProperty(propertyName)) {
      return mapping[mapping.jsonKeys[propertyName]];
    }
  }
}


/**
 * @function
 * @name convertFromRaw
 * @private
 *
 * @description
 * Convert a raw JSON object into an object similar to what the resource would look like, by
 * transforming the properties in the same way.
 *
 * @param {object} object raw object from the server
 * @param {INModelObject} resource resource class
 */
function convertFromRaw(object, resource) {
  var mapping = resource.resourceMapping;
  var out;
  if (!mapping) return;
  out = {};

  forEach(mapping.jsonKeys, function copyMappedProperties(propertyName, jsonKey) {
    var mappingInfo = mapping[propertyName];
    var cast = mappingInfo.to;
    var cnst = mappingInfo.cnst;
    var isObject;
    var currentValue;

    if (hasProperty(object, jsonKey)) {
      currentValue = object[jsonKey];
      if (propertyName !== jsonKey) {
        delete object[jsonKey];
      }

      if (cnst) {
        object[propertyName] = cnst;
      } else {
        cast = cast(currentValue, mappingInfo);
        isObject = cast && typeof cast === 'object';
        if (typeof currentValue !== 'undefined') {
          object[propertyName] = cast;
        }
      }
    } else if (cnst) {
      object[propertyName] = cnst;
    }
  });
  defineProperty(object, '__converted_from_raw__', INVISIBLE, null, null, true);
}


/**
 * @property
 * @name INModelObject#id
 *
 * The id of the model object. This should be treated as private and read-only.
 */


/**
 * @property
 * @name INModelObject#namespaceId
 *
 * The ID of the associated namespace for this model object, should be treated as read-only.
 */


/**
 * @property
 * @name INModelObject#createdAt
 *
 * The date this model object was created. Read-only.
 */


/**
 * @property
 * @name INModelObject#updatedAt
 *
 * The date this model object was updated. Read-only.
 */
defineResourceMapping(INModelObject, {
  'id': 'id',
  'namespaceId': 'namespace_id',
  'createdAt': 'date:created_at',
  'updatedAt': 'date:updated_at'
}, null);


/**
 * @function
 * @name INModelObject#inbox
 *
 * @description
 * Returns the associated {InboxAPI} instance used to create this model object.
 */
defineProperty(INModelObject.prototype, 'inbox', INVISIBLE, null, null, function(resolver) {
  return this._.inbox;
});


/**
 * @function
 * @name INModelObject#promise
 *
 * @description
 * Helper for constructing a Promise object using the configured promise constructor.
 *
 * @param {function(function, function)} resolver Callback function which performs a task and
 *   fulfills the constructed promise.
 *
 * @returns {Promise} the constructed promise.
 */
defineProperty(INModelObject.prototype, 'promise', INVISIBLE, null, null, function(resolver) {
  return this.inbox().promise(resolver);
});
