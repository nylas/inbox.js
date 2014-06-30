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