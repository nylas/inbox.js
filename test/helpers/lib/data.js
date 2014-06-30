function __extend(obj, newContent) {
  if (obj && typeof obj === 'object') {
    if (IsArray(obj)) {
      return Merge(Merge([], obj), newContent);
    } else {
      return Merge(Merge({}, obj), newContent);
    }
  }
}
