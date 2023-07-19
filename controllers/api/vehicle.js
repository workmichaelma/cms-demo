const route = require('express').Router();
const { isEmpty } = require('lodash');
const core = require('./core');

const { COLLECTIONS, dbMap } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/vehicle');

const collection_name = COLLECTIONS.VEHICLE;

route.use(async (req, res, next) => {
  await core.buildAPI({
    route,
    __MODEL__,
    collection_name,
    exclude: ['/get/:_id'],
  });
  await core.buildAllSelect({
    route,
    __MODEL__,
    collection_name,
    label: 'chassis_number',
  });
  next();
});

// // Fetch by frontend table
// route.get('/lists', async (req, res) => {
// 	try {
// 		const { data, err } = await __MODEL__.Model.query(req);
// 		const schema = __MODEL__.schema;
// 		if (err || !data) {
// 			throw new Error(err);
// 		} else {
// 			res.json({ data, schema });
// 		}
// 	} catch (err) {
// 		console.error(`/app/controllers/api/${collection_name}/lists`, err);
// 		res.json(null);
// 	}
// });

const _populate = [
  {
    path: 'licenses',
    populate: {
      path: 'license',
      model: 'license',
      populate: [
        {
          path: 'contract',
          model: 'contract',
        },
        {
          path: 'reg_mark',
          model: 'reg_mark',
        },
      ],
    },
  },
  {
    path: 'permit_areas',
    populate: {
      path: 'permit_area',
      model: 'permit_area',
      populate: {
        path: 'contract',
        model: 'contract',
      },
    },
  },
  {
    path: 'insurances',
    populate: {
      path: 'insurance',
      model: 'insurance',
      populate: [
        {
          path: 'contract',
          model: 'contract',
        },
        {
          path: 'reg_mark',
          model: 'reg_mark',
        },
      ],
    },
  },
  {
    path: 'companies',
    populate: {
      path: 'company',
      model: 'company',
    },
  },
  {
    path: 'contracts',
    populate: {
      path: 'contract',
      model: 'contract',
    },
  },
  {
    path: 'reg_marks',
    populate: {
      path: 'reg_mark',
      model: 'reg_mark',
    },
  },
];

// Return entity By Id
route.get('/get/:_id', async (req, res) => {
  try {
    const schema = __MODEL__.schema;
    const pageConfig = __MODEL__.pageConfig;
    const { record, err } = await __MODEL__.Model.findOneById({
      req,
      _populate,
    });
    if (record) {
      const { _doc: drivers } = await __MODEL__.Model.getAllDrivers(record._id);
      if (drivers) {
        record.drivers = drivers;
      }
      const { _doc: autotolls } = await __MODEL__.Model.getAllAutotolls(
        record._id
      );
      if (autotolls) {
        record.autotolls = autotolls;
      }
      const { _doc: gpses } = await __MODEL__.Model.getAllGpses(record._id);
      if (gpses) {
        record.gpses = gpses;
      }
      const { _doc: fuels } = await __MODEL__.Model.getAllFuels(record._id);
      if (fuels) {
        record.fuels = fuels;
      }
      const { _doc: contract_deducts } =
        await __MODEL__.Model.getAllContractDeducts(record);
      if (!isEmpty(contract_deducts)) {
        record.contract_deducts = contract_deducts;
        record.current_contract_deduct = contract_deducts[0];
      }

      record.current_reg_mark = await __MODEL__.Model.getCurrentRegMark({
        _doc: record,
      });
    }
    if (err) {
      throw new Error(err);
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
