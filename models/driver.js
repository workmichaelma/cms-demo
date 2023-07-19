const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isUndefined, isString, reduce } = require('lodash');
const {
  withSchemaField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');
const { aggregate, handleQuery } = require('./listing');
const crypto = require('../helpers/crypto');

const hideHKID = (hkid) => {
  const id = crypto.decrypt(hkid) || '';
  return id.substr(0, 4);
};

const collection_name = COLLECTIONS.DRIVER;
const schema = {
  staff_number: {
    title: '員工編號',
    type: 'text',
    placeholder: 'staff_number: ',
    is_multiple: false,
    is_required: true,
    editable: false,
  },
  // contract_driver: {
  //   title: '合約司機',
  //   type: 'text',
  //   placeholder: 'contract_driver: ',
  //   is_multiple: false,
  // },
  name: {
    title: '司機英文名稱',
    type: 'text',
    placeholder: 'name e.g. Chan tai Man',
    is_required: true,
    is_multiple: false,
  },
  name_tc: {
    title: '司機名稱',
    type: 'text',
    placeholder: 'name_tc e.g. 陳大文',
    is_multiple: false,
  },
  hkid: {
    title: 'HKID',
    type: 'text',
    is_multiple: false,
    is_required: true,
    editable: false,
  },
  license: {
    title: '駕駛執照',
    type: 'text',
    placeholder: 'license e.g. 1 / 2 / 18 / 19',
    is_multiple: false,
    select: ['1', '2', '18', '19'],
    free_solo: false,
  },
  dob: {
    title: '出生日期',
    type: 'date',
    is_multiple: false,
  },
  remarks: {
    title: '備註',
    type: 'textarea',
  },
  companies: {
    title: 'Company',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      company: {
        type: 'relation',
        foreign: 'company',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withSchemaField(schema, [
          'staff_number',
          'name',
          'name_tc',
          'license',
          'dob',
          'hkid',
          'status',
        ]),
      },
    },
    profile: {
      fieldsToDisplay: ['status', ...withProfileFieldsToDisplay(schema)],
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.buildCustomInputVirtualFields(Schema, [
  'company_id',
  'company_effective_date',
  'company_end_date',
  'company_object_id',
]);

Schema.virtual('current_company').get(function () {
  if (!isEmpty(this.companies)) {
    return this.companies.slice(-1)[0];
  }
  return null;
});

Schema.plugin(Core.updateLogPlugin);

/* Schema methods */
Schema.statics.customQuery = async function (
  req,
  schema,
  fieldsToDisplay,
  props
) {
  const { filters, queryObject } = handleQuery(req);
  const searchPipeline = [];
  const projectionPipeline = [];
  if (filters.hkid) {
    const _docs = await this.find({}, '_id hkid').exec();
    if (_docs && !isEmpty(_docs)) {
      const filteredId = reduce(
        _docs,
        (ids, doc) => {
          const hkid = hideHKID(doc.hkid);
          if (hkid && hkid.match(filters.hkid.$regex)) {
            ids.push(doc._id);
          }
          return ids;
        },
        []
      );
      if (isEmpty(filteredId)) {
        searchPipeline.push({ $match: { _id: null } });
      } else {
        searchPipeline.push(
          ...[
            {
              $match: {
                _id: {
                  $in: filteredId,
                },
              },
            },
          ]
        );
      }
      delete filters.hkid;
    }
  }

  const result = await aggregate({
    _this: this,
    fieldsToDisplay,
    searchPipeline,
    projectionPipeline,
    filters,
    queryObject,
  });
  if (result && result?.data) {
    return {
      data: {
        ...result?.data,
        records: (result?.data?.records || []).map((r) => {
          return {
            ...r,
            hkid: hideHKID(r.hkid),
          };
        }),
      },
    };
  }
  return result;
};

// Update record
Schema.pre('findOneAndUpdate', function (next) {
  try {
    const update = this.getUpdate();

    // Update latest company data
    if (update['input__company_object_id']) {
      if (update['input__company_effective_date']) {
        update.$set['companies.$[companies].effective_date'] =
          update['input__company_effective_date'];
      }
      if (update['input__company_end_date']) {
        update.$set['companies.$[companies].end_date'] =
          update['input__company_end_date'];
      }

      this.setOptions({
        arrayFilters: [{ 'companies._id': update['input__company_object_id'] }],
      });
      // Add a new company record
    } else if (!isUndefined(update['input__company_id'])) {
      update.$push = {};
      update.$push['companies'] = {
        company: update['input__company_id']
          ? new mongoose.Types.ObjectId(update['input__company_id'])
          : undefined,
        effective_date: update['input__company_effective_date'] || undefined,
        end_date: update['input__company_end_date'] || undefined,
      };
    }

    next();
  } catch (err) {
    console.error(err);
  }
});

// Create new record
Schema.pre('save', function (next) {
  try {
    const {
      input__company_id,
      input__company_effective_date,
      input__company_end_date,
    } = this;
    if (
      isString(input__company_id) ||
      input__company_effective_date ||
      input__company_end_date
    ) {
      this.companies = [
        {
          company: isString(input__company_id)
            ? new mongoose.Types.ObjectId(input__company_id)
            : undefined,
          effective_date: input__company_effective_date,
          end_date: input__company_end_date,
        },
      ];
    }
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/* Schema methods */
const Model = Core.buildModel({ schema: Schema, collection_name });
schema.status = {
  title: 'Status',
  type: 'boolean',
  is_required: true,
  editable: true,
};

module.exports = {
  Model,
  schema,
  pageConfig,
};
