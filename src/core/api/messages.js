/**
 * @class InboxMessage
 *
 * Class which represents a specific Message associated with a Thread.
 *
 * @param {InboxThread} thread The InboxThread object which this InboxMessage is to be
 *   associated with.
 *
 * @param {Object} data The data associated with a given InboxThread. This data arrives from a
 *   successful response from a server, and should always contain the expected properties. However,
 *   it is necessary for the object to contain a property `id`.
 *
 * @throws {TypeError} The InboxThread constructor will throw under the circumstances that we have
 *   no `id` property in the response, or if the response object is null or undefined,
 *   or if the `thread` parameter is not an instance of InboxThread.
 */
function InboxMessage(thread, data) {
  var namespace;
  if (!(thread instanceof InboxThread)) {
    throw new TypeError("Cannot construct 'InboxMessage': `thread` parameter must be InboxThread");
  }

  if (!data || typeof data !== "object") {
    throw new TypeError("Cannot construct 'InboxMessage': `data` does is not an object.");
  }

  if (!data.id) {
    throw new TypeError("Cannot construct 'InboxMessage': `data` does not contain `id` key");
  }

  if (!(this instanceof InboxMessage)) {
    return new InboxMessage(thread, data);
  }
  namespace = thread._.namespace;
  this._ = {
    inbox: thread._.inbox,
    namespace: namespace,
    thread: thread,
    messageId: data.id,
    messageUrl: URLFormat('%@/messages/%@', namespace._.namespaceUrl, data.id)
  };

  if (data && typeof data === 'object') {
    Merge(this, data);
  }

  DefineProperty(this, '_', INVISIBLE);
}