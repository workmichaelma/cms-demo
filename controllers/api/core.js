const { isArray, isEmpty, reduce, last } = require('lodash');
const { decrypt } = require('../../helpers/crypto');
const multer = require('multer');
const upload = multer();
const isDev = process.env.mode === 'dev';

const MODELS = require(_base + 'app/models/index');

const fileHandler = async (req, data) => {
  if (req.files && req.files.length > 0) {
    const { __FILE__ } = MODELS;
    const requests = [];
    for (index in req.files) {
      const result = await __FILE__.Model.uploadFile({
        file: req.files[index],
        user_id: req.session.user_id,
      });
      requests.push(result);
    }
    const result = await Promise.all(requests);
    data = reduce(
      result,
      (prev, filedata) => {
        if (filedata?._id && filedata?.fieldname) {
          prev[filedata.fieldname] = filedata._id;
        }
        return prev;
      },
      data
    );
  }
};

const postJSONBody = (body) => {
  return reduce(
    body,
    (data, value, key) => {
      data[key] = JSON.parse(value);
      return data;
    },
    {}
  );
};

const buildAPI = ({
  route,
  __MODEL__,
  collection_name,
  exclude = [],
  props,
}) => {
  if (!exclude.includes('/schema')) {
    // Return Schema
    route.get('/schema', async (req, res) => {
      try {
        res.json({
          schema: __MODEL__.schema,
          pageConfig: __MODEL__.pageConfig,
          title: __MODEL__.title,
        });
      } catch (err) {
        console.error(
          `/app/controllers/api/${collection_name}/get/schema`,
          err
        );
        res.send(null);
      }
    });
  }

  if (!exclude.includes('/column/:column')) {
    route.get('/column/:column', async (req, res) => {
      const { column } = req.params;
      try {
        const result = await __MODEL__.Model.distinctColumn({ column });
        if (result && isArray(result)) {
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
  }

  if (!exclude.includes('/get/:_id')) {
    // Return entity By Id
    route.get('/get/:_id', async (req, res) => {
      try {
        const { record, err } = await __MODEL__.Model.findOneById({ req });
        const schema = __MODEL__.schema;
        const pageConfig = __MODEL__.pageConfig;
        if (schema?.vehicles && schema?.current_vehicle && record) {
          record.current_vehicle = last(record?.vehicles || []);
          record.vehicles = record.vehicles.reverse();
        }
        if (record.hkid) {
          const id = decrypt(record.hkid) || '';
          record.hkid = id.substr(0, 4);
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
  }

  if (!exclude.includes('/lists')) {
    // Fetch by frontend table
    route.get('/lists', async (req, res) => {
      try {
        let result = {};
        const fieldsToDisplay =
          Object.keys(
            __MODEL__?.pageConfig?.pages?.listing?.fieldsToDisplay || {}
          ) || {};
        if (props?.useCustomQuery) {
          result = await __MODEL__.Model.customQuery(
            req,
            __MODEL__.schema,
            fieldsToDisplay
          );
        } else {
          result = await __MODEL__.Model.query(
            req,
            __MODEL__.schema,
            fieldsToDisplay
          );
        }
        const { data, err } = result;
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
  }

  if (!exclude.includes('/new')) {
    // Post new entity
    route.post('/new', upload.any(), async function (req, res) {
      try {
        const body = postJSONBody(req?.body);
        let data = { ...body };
        await fileHandler(req, data);
        const { _doc, err } = await __MODEL__.Model.insert({
          body: data,
          files: req.files,
          user_id: req.session.user_id,
        });

        if (_doc && _doc._id) {
          res.json({ _id: _doc._id });
        } else if (err) {
          throw new Error(err);
        } else {
          throw new Error(`Failed to create new ${collection_name}`);
        }
      } catch (err) {
        console.error(`/app/controllers/api/${collection_name}/new`, err);
        res.status(400).json({ err });
      }
    });
  }

  if (!exclude.includes('/import')) {
    // Import new entity
    route.post('/import', upload.any(), async function (req, res) {
      try {
        const rows = JSON.parse(req?.body?.body || '');
        if (rows && !isEmpty(rows)) {
          const { _docs } = await __MODEL__.Model.import({ body: rows });

          if (_docs && !isEmpty(_docs)) {
            res.json(
              reduce(
                _docs,
                (result, doc) => {
                  if (doc.err) {
                    result.failed++;
                  } else {
                    result.success++;
                  }
                  return result;
                },
                { success: 0, failed: 0, _docs }
              )
            );
          } else {
            throw new Error(
              `Failed to import ${collection_name}, reason: body is empty`
            );
          }
        } else {
          throw new Error(`Failed to import ${collection_name}`);
        }
      } catch (err) {
        console.error(`/app/controllers/api/${collection_name}/import`, err);
        res.json(null);
      }
    });
  }

  if (!exclude.includes('/update/:_id')) {
    // Update entity By Id
    route.put('/update/:_id', upload.any(), async (req, res) => {
      const { _id } = req?.params || {};
      try {
        const body = postJSONBody(req?.body);
        let data = { ...body };
        await fileHandler(req, data);
        if (_id && req.body) {
          const result = await __MODEL__.Model.update({
            _id,
            body: data,
            files: req.files,
            user_id: req.session.user_id,
          });

          res.json(result);
        } else {
          throw new Error('No id or body provided');
        }
      } catch (err) {
        console.error(
          `/app/controllers/api/${collection_name}/update/${_id}`,
          err
        );
        res.json(null);
      }
    });
  }
};

const buildAllSelect = ({
  route,
  __MODEL__,
  collection_name,
  label = '',
  sort = {},
  custom_data = '',
}) => {
  if (label) {
    route.get(`/all-${collection_name}-select`, async (req, res) => {
      try {
        const { statusless } = req.query;
        const params = {
          status: true,
        };
        if (isDev || statusless) {
          delete params.status;
        }
        const _doc = await __MODEL__.Model.find(params, `_id ${label}`).sort(
          sort
        );
        if (!_doc) {
          throw new Error(err);
        } else {
          const data = _doc.map((v) => {
            if (v[custom_data]) {
              return {
                label: v[label],
                _id: v._id,
                [custom_data]: v[custom_data],
              };
            } else {
              return {
                label: v[label],
                _id: v._id,
              };
            }
          });

          res.json(data);
        }
      } catch (err) {
        console.error(
          `/app/controllers/api/${collection_name}/all-gps-select`,
          err
        );
        res.json(null);
      }
    });
  }
};

const buildGetWithVehicle = ({ route, __MODEL__, collection_name }) => {
  route.get('/get/:_id', async (req, res) => {
    try {
      const { record, err } = await __MODEL__.Model.findOneById({ req });
      const schema = __MODEL__.schema;
      if (record) {
        const [_doc] = await __MODEL__.Model.getVehicleById(record._id);
        if (_doc) {
          record.vehicle = {
            chassis_number: _doc.chassis_number,
            _id: _doc._id,
          };
        }
      }
      if (err) {
        throw new Error(err);
      } else {
        res.json({
          record,
          schema,
        });
      }
    } catch (err) {
      console.error(`/app/controllers/api/${collection_name}/get/:id`, err);
      res.send(null);
    }
  });
};

module.exports = { buildAPI, buildAllSelect, buildGetWithVehicle };
