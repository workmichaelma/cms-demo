const Core = require('./core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const crypto = require(_base + 'app/helpers/crypto');
const {
  checkFieldIsValid,
  withSchemaField,
  withVehicleField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');

const collection_name = COLLECTIONS.USER;

const schema = {
  username: {
    title: 'Username',
    type: 'text',
    is_required: true,
  },
  password: {
    title: 'Password',
    type: 'text',
    is_required: true,
    is_password: true,
  },
  display_name: {
    title: 'Display Name',
    type: 'text',
    is_required: false,
  },
  is_admin: {
    title: 'Is Admin',
    type: 'boolean',
  },
  permissions: {
    title: 'Permission',
    type: 'text',
    is_multiple: true,
    checkbox: ['*', 'contract', 'company', 'vehicle', 'driver', 'reg_mark'],
    default: ['*'],
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withSchemaField(schema, [
          'display_name',
          'username',
          'is_admin',
          'status',
        ]),
      },
    },
    profile: {
      fieldsToDisplay: [
        'status',
        ...withProfileFieldsToDisplay(schema, ['permissions']),
      ],
    },
  },
};

const Schema = Core.buildSchema(schema);
Schema.statics.login = async function ({ username, password }) {
  try {
    const doc = await this.findOne({ username });
    if (!doc) {
      throw new Error('User not found!');
    } else {
      const { _doc } = doc;
      if (_doc.status === true) {
        if (crypto.decrypt(_doc.password) === password) {
          console.log(`User <${_doc.username}> logged in`);
          return _doc;
        }
      } else {
        throw new Error('status is false');
      }
      return null;
    }
  } catch (err) {
    console.error(`<${username}> Failed to login, reason: ${err}`);
    return null;
  }
};
Schema.statics.register = async function ({
  username,
  password,
  user_id,
  status,
  is_admin,
}) {
  try {
    const result = await this.findOne({ username });
    if (result) {
      throw new Error('User already exists!');
    } else {
      const { _doc } = await this.insert({
        body: {
          username,
          password: crypto.encrypt(password),
          status,
          is_admin,
        },
        user_id,
      });
      if (_doc) {
        return { ok: true };
      } else {
        return {
          err: 'Something went wrong...',
        };
      }
    }
  } catch (err) {
    console.error(`<${username}> Failed to register, reason: ${err}`);
    return { err };
  }
};
Schema.plugin(Core.updateLogPlugin);

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
