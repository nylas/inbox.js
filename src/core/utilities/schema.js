function InboxSchema(name, propertiesOrPrimitiveType, isCollection, id) {
  if (typeof name !== 'string') {
    throw new TypeError('Cannot construct `InboxSchema`: name must be a string');
  }

  if (!(this instanceof InboxSchema)) {
    return new InboxSchema(name, propertiesOrPrimitiveType, isCollection, id);
  }

  this.properties = this.primitiveType = null;
  this.id = null;
  if (typeof propertiesOrPrimitiveType === 'string') {
    this.primitiveType = propertiesOrPrimitiveType;
  } else if (typeof propertiesOrPrimitiveType === 'object') {
    this.primitiveType = 'object';
    this.properties = propertiesOrPrimitiveType;
    this.id = id || null;
  } else {
    throw new TypeError('Cannot construct `InboxSchema`: propertiesOrPrimitiveType must be object ' +
                        'or string.');
  }
  this.isCollection = !!isCollection;
}

InboxSchema.prototype.merge = function(oldData, newData) {
  var key, properties, targetProp;
  if (oldData === newData) {
    return;
  }

  if (this.isCollection) {
    return MergeInboxSchemaCollection(this, oldData, newData);
  }

  properties = this.properties;
  if (!properties) {
    throw new TypeError('Cannot invoke `merge` on `InboxSchema`: is primitive Schema.');
  }

  for (key in properties) {
    if (!this.properties.hasOwnProperty(key)) {
      continue;
    }

    target = properties[key];

    if (oldData[key] && newData[key]) {
      if (oldData[key] === newData[key]) {
        continue;
      } else if (target.isCollection) {
        MergeInboxSchemaCollection(target, oldData[key], newData[key]);
      } else if (target.primitiveType === 'object') {
        target.merge(oldData[key], newData[key]);
      } else {
        oldData[key] = newData[key];
      }
    } else if (oldData[key]) {
      delete oldData[key];
    } else if (newData[key]) {
      oldData[key] = newData[key];
    }
  }

  // add unknown data
  for (key in newData) {
    if (newData.hasOwnProperty(key) && !properties[key]) {
      oldData[key] = newData[key];
    }
  }
}

function MergeInboxSchemaCollection(schema, oldData, newData) {
  var properties = schema.properties;
  var i, ii;
  if (!properties) {
    // collection of primitives --- just copy the new data in, in order.
    // TODO(@caitp): support plain objects if needed
    oldData.length = newData.length;
    for (i=0, ii=newData.length; i<ii; ++i) {
      oldData[i] = newData[i];
    }
  } else if (properties instanceof InboxSchema) {
    // collection of a type
    if (properties.isCollection) {
      // TODO(@caitp): support nested collection
    } else {
      MergeArray(oldData, newData, schema.id, ValueFn);
    }
  }
}

var INBOX_STRING_SCHEMA = InboxSchema('String', 'string', false);
var INBOX_STRINGS_SCHEMA = InboxSchema('Strings', INBOX_STRING_SCHEMA, true);
var INBOX_NUMBER_SCHEMA = InboxSchema('Number', 'number', false);
var INBOX_NUMBERS_SCHEMA = InboxSchema('Numbers', INBOX_NUMBER_SCHEMA, true);

var InboxNamespaceSchema = InboxSchema('InboxNamespace', {
  "account": INBOX_STRING_SCHEMA,
  "email_address": INBOX_STRING_SCHEMA,
  "id": INBOX_STRING_SCHEMA,
  "namespace": INBOX_STRING_SCHEMA,
  "object": INBOX_STRING_SCHEMA,
  "provider": INBOX_STRING_SCHEMA
}, false, 'id');

var InboxNamespacesSchema = InboxSchema('InboxNamespaces', InboxNamespaceSchema, true);

var InboxParticipantSchema = InboxSchema('InboxParticipant', {
  "email": INBOX_STRING_SCHEMA,
  "name": INBOX_STRING_SCHEMA
}, false, 'email');

var InboxParticipantsSchema = InboxSchema('InboxParticipants', InboxParticipantSchema, true);

var InboxTagSchema = InboxSchema('InboxTag', {
  "id": INBOX_STRING_SCHEMA,
  "name": INBOX_STRING_SCHEMA,
  "object": INBOX_STRING_SCHEMA
}, false, 'id');

var InboxTagsSchema = InboxSchema('InboxTags', InboxTagSchema, true);

var InboxThreadSchema = InboxSchema('InboxThread', {
  "drafts": INBOX_STRINGS_SCHEMA,
  "id": INBOX_STRING_SCHEMA,
  "mesages": INBOX_STRINGS_SCHEMA,
  "namespace": INBOX_STRING_SCHEMA,
  "object": INBOX_STRING_SCHEMA,
  "participants": InboxParticipantsSchema,
  "snippet": INBOX_STRING_SCHEMA,
  "subject": INBOX_STRING_SCHEMA,
  "subject_date": INBOX_NUMBER_SCHEMA,
  "tags": InboxTagsSchema
}, false, 'id');

var InboxThreadsSchema = InboxSchema('InboxThreads', InboxThreadSchema, true);