function __extend(obj, newContent) {
  if (obj && typeof obj === 'object') {
    if (isArray(obj)) {
      return merge(merge([], obj), newContent);
    } else {
      return merge(merge({}, obj), newContent);
    }
  }
}
