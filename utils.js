module.exports = {
  peek: value => {
    console.log(value);
    return value;
  },

  pluck: (raw, fields) => {
    const result = {};

    fields.map(field => {
      result[field] = raw[field];
    });

    return result;
  },

  rename: (raw, transforms) => {
    const result = Object.assign({}, raw);

    transforms.forEach(({from, to}) => {
      result[to] = result[from];
      delete result[from];
    });

    return result;
  },

  flatten: arrays => [].concat.apply([], arrays),

  nextDay: date => {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + 1);
    return next;
  }
};
