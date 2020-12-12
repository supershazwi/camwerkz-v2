Repairs = new Mongo.Collection('repairs');

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Repairs.search = function(query) {
  if (!query) {
    return;
  }

  return Repairs.find({
    queryName: { $regex: RegExp.escape(query), $options: 'i' },
  }, {
    limit: 20
  });
};