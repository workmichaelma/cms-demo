const route = require('express').Router();
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/driver_permit');
const { decrypt } = require('../../helpers/crypto');

const collection_name = COLLECTIONS.DRIVER_PERMIT;

route.use(async (req, res, next) => {
  await core.buildAPI({
    route,
    __MODEL__,
    collection_name,
    exclude: ['/get/:_id'],
  });
  next();
});

// Return vehicles by driver and company
route.get('/get-vehicles', async (req, res) => {
  try {
    const record = await __MODEL__.Model.getVehiclesByDriverAndCompany({
      driver: req.query.driver,
      company: req.query.company,
    });

    if (!record) {
      throw new Error('No record found');
    } else {
      res.json(record);
    }
  } catch (err) {
    console.error(`/app/controllers/api/${collection_name}/get/:id`, err);
    res.send(null);
  }
});

// Return entity By Id
route.get('/get/:_id', async (req, res) => {
  try {
    const record = await __MODEL__.Model.findOne({
      _id: req.params._id,
    })
      .populate('driver')
      .populate('approval_file')
      .populate({
        path: 'company',
        populate: [
          { path: 'logo_image', model: 'file' },
          { path: 'sign_image', model: 'file' },
          { path: 'chop_image', model: 'file' },
        ],
      })
      .populate({
        path: 'vehicles',
        populate: { path: 'current_reg_mark', model: 'reg_mark' },
      })
      .lean({ virtuals: true });

    if (record?.driver?.hkid) {
      record.driver.hkid = decrypt(record.driver.hkid) || '';
    }

    const schema = __MODEL__.schema;
    const pageConfig = __MODEL__.pageConfig;

    if (!record) {
      throw new Error('No record found');
    } else {
      res.json({
        record,
        schema,
        pageConfig,
      });
    }
  } catch (err) {
    console.error(`/app/controllers/api/${collection_name}/get/:id`, err);
    res.send(null);
  }
});

module.exports = route;
