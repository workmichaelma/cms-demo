const route = require('express').Router();
const { decrypt } = require('../../helpers/crypto');
const { isArray } = require('lodash');
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/driver');

const collection_name = COLLECTIONS.DRIVER;

route.use(async (req, res, next) => {
  await core.buildAPI({
    route,
    __MODEL__,
    collection_name,
    props: {
      useCustomQuery: true,
    },
    exclude: ['/column/:column'],
  });
  await core.buildAllSelect({
    route,
    __MODEL__,
    collection_name,
    label: 'name',
    custom_data: 'license',
  });
  next();
});

route.get('/column/:column', async (req, res) => {
  const { column } = req.params;
  try {
    let result = await __MODEL__.Model.distinctColumn({ column });
    if (result && isArray(result)) {
      if (column === 'hkid') {
        result = result.map((r) => {
          return {
            _id: r._id,
            label: decrypt(r.label),
          };
        });
      }
      res.json(result);
    } else {
      throw new Error('Failed to get distinct column');
    }
  } catch (err) {
    console.error(
      `/app/controllers/api/${collection_name}/column/${column}`,
      err
    );
    res.send(null);
  }
});

module.exports = route;
