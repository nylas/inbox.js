function StringFormat(template, args) {
  var i = 0, ii;
  args = Array.prototype.slice.call(arguments, 1);
  ii = args.length;
  return template.replace(/\%\@/g, function() {
    if (i < ii) {
      return '' + args[i++];
    }
    return '';
  });
}
