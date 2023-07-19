const route = require('express').Router();
const { isEmpty } = require('lodash');
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/reg_mark');

const collection_name = COLLECTIONS.REG_MARK;

// Fetch by frontend table
route.get('/lists', async (req, res) => {
  try {
    const { data, err } = await __MODEL__.Model.customQuery(
      req,
      __MODEL__.schema,
      Object.keys(
        __MODEL__?.pageConfig?.pages?.listing?.fieldsToDisplay || {}
      ) || [],
      {
        empty_reg_mark: true,
      }
    );
    const schema = __MODEL__.schema;
    const pageConfig = __MODEL__.pageConfig;
    if (err || !data) {
      throw new Error(err);
    } else {
      res.json({ data, schema, pageConfig });
    }
  } catch (err) {
    console.error(`/app/controllers/api/${collection_name}/lists`, err);
    res.json(null);
  }
});
module.exports = route;
