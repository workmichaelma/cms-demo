const router = require('express').Router();
const path = require('path');
var fs = require('fs');
const { get, isEmpty } = require('lodash');
const qs = require('qs');
const mongoose = require('mongoose');
const User = require(_base + 'app/models/user');

router.use('/admin', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

router.get('/fake-user', async (req, res) => {
  const data = {
    username: 'admin',
    password: '1234',
    status: true,
    is_admin: true,
  };
  await User.Model.register(data);
  await User.Model.login(data);
  res.json({ ok: true });
});

router.use('/user', require('./user'));

router.use('/api/contract', require('./api/contract'));
router.use('/api/company', require('./api/company'));
router.use('/api/vehicle', require('./api/vehicle'));
router.use('/api/reg_mark', require('./api/reg_mark'));
router.use('/api/empty_reg_mark', require('./api/empty_reg_mark'));
router.use('/api/driver', require('./api/driver'));
router.use('/api/contract_deduct', require('./api/contract_deduct'));
router.use('/api/permit_area', require('./api/permit_area'));
router.use('/api/license', require('./api/license'));
router.use('/api/valid_license', require('./api/valid_license'));
router.use('/api/insurance', require('./api/insurance'));
router.use('/api/valid_insurance', require('./api/valid_insurance'));
router.use('/api/gps', require('./api/gps'));
router.use('/api/autotoll', require('./api/autotoll'));
router.use('/api/fuel', require('./api/fuel'));
// router.use('/api/expenses_autotoll', require('./api/expenses_autotoll'));
// router.use('/api/expenses_fuel', require('./api/expenses_fuel'));
router.use('/api/driver_permit', require('./api/driver_permit'));
// router.use('/api/repair_record', require('./api/repair_record'));
// router.use('/api/monthly_vehicle', require('./api/monthly_vehicle'));
// router.use('/api/vehicle_summary', require('./api/vehicle_summary'));
// router.use('/api/monthly_expenses', require('./api/monthly_expenses'));
router.use('/api/log', require('./api/log'));
router.use('/api/user', require('./api/user'));
router.use('/api/gps', require('./api/gps'));
router.use('/file', require('./api/file'));

const __CONTRACT__ = require('../models/contract');
const __COMPANY__ = require('../models/company');
const __VEHICLE__ = require('../models/vehicle');
const __REGMARK__ = require('../models/reg_mark');
const __DRIVER__ = require('../models/driver');
const __CONTRACTDEDUCT__ = require('../models/contract_deduct');
const __PERMITAREA__ = require('../models/permit_area');
const __LICENSE__ = require('../models/license');
const __INSURANCE__ = require('../models/insurance');
const __GPS__ = require('../models/gps');
const __AUTOTOLL__ = require('../models/autotoll');
const __FUEL__ = require('../models/fuel');

const csvtojson = require('csvtojson');
const { reduce } = require('lodash');
const dayjs = require('dayjs');
router.get('/import-csv', async (req, res) => {
  const vehicle = await csvtojson().fromFile(_base + 'import/vehicle.csv');
  const contract = await csvtojson().fromFile(_base + 'import/contract.csv');
  const company = await csvtojson().fromFile(_base + 'import/company.csv');

  const vehicles = await __VEHICLE__.Model.insertMany(
    vehicle.map((item) => {
      return reduce(
        item,
        (obj, v, k) => {
          if (k === 'rearview_mirror' || k === 'car_loan' || k === 'new_car') {
            if (v === 'Y') {
              obj[k] = true;
            } else {
              obj[k] = false;
            }
          } else if (
            k === 'maintainance_end_date' ||
            k === 'owner_registration_date' ||
            k === 'first_registration_date'
          ) {
            console.log(v);
            obj[k] = v ? dayjs(v).toISOString() : '';
          } else {
            obj[k] = v === 'null' || v === '-' ? '' : v;
          }
          return obj;
        },
        {}
      );
    })
  );
  const companies = await __COMPANY__.Model.insertMany(
    company.map((item) => {
      return reduce(
        item,
        (obj, v, k) => {
          obj[k] = v === 'null' || v === '-' ? '' : v;
          return obj;
        },
        {}
      );
    })
  );
  const contracts = await __CONTRACT__.Model.insertMany(
    contract.map((item) => {
      return reduce(
        item,
        (obj, v, k) => {
          if (k !== 'updated_by') {
            obj[k] = v === 'null' || v === '-' ? '' : v;
          }
          return obj;
        },
        {}
      );
    })
  );
  res.json({ vehicles, contracts, companies });
});

module.exports = router;
