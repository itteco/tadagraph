(function(doc, req) {

  function out(str) {
    return {
      headers: {
        'Content-Type': 'text/javascript'
      },
      body: req.query.callback ? [req.query.callback, str].join('') :
                                 str
    };
  };
  
  if (!doc || !doc.couchapp || !doc.couchapp.manifest) return out('');
  
  var lines = ['(function(doc){'];
  
  doc.couchapp.manifest.filter(function(path) {
    return path.match(/\.js$/) !== null;
  }).forEach(function(fullpath) {
    var path = fullpath.split('/'),
        filename = path.pop().replace(/\.js$/, ''),
        place = path.reduce(function(prev, fragment) {
          return prev[fragment] = prev[fragment] || {};
        }, doc),
        content = place[filename];
    
    path = path.map(function(fragment) {
      return fragment.match(/^[\w\d]+$/) === null ? '[\'' + fragment + '\']' :
                                                    '.' + fragment;
    });
    
    if (content.match(/^[^\w]*function/) == null) return;
    
    lines.push('', '', '', '',
               '/**',
               ' * ' + fullpath,
               ' */',
               '', '', '', '',
               ['doc'].concat(path, ['.', filename]).join('') + ' = ' + content);
    place[filename] = 0;
  });
  
  lines.push(['return doc;})(', JSON.stringify(doc), ');\r\n'].join(''));
  
  return out(lines.join('\r\n'));

})
