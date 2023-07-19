const { Storage } = require('@google-cloud/storage');
const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const {
  COLLECTIONS,
  cloud_storage_bucket,
  cloud_storage_key,
  cloud_storage_project_id,
} = require(_base + 'app/config/config');

const title = 'File';
const collection_name = COLLECTIONS.FILE;
const schema = {
  filename: {
    title,
    type: 'text',
  },
  name: {
    title: '檔案名稱',
    type: 'text',
  },
  url: {
    title: 'URL',
    type: 'text',
  },
  size: {
    title: '檔案大小',
    type: 'text',
  },
  mimetype: {
    title: 'MIMEType',
    type: 'text',
  },
};

let Schema = Core.buildSchema(schema);

Schema.plugin(Core.updateLogPlugin);

const storage = new Storage({
  projectId: cloud_storage_project_id,
  keyFilename: cloud_storage_key,
});

/* Schema methods */
Schema.statics.getFile = async function ({ filename }) {
  try {
    const bucket = storage.bucket(cloud_storage_bucket);
    const file = bucket.file(filename);
    const exists = await file.exists();
    if (!exists[0]) {
      return null;
    }
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType;
    const buffer = await file.download();
    const data = buffer[0];
    if (data && contentType) {
      return {
        data,
        contentType,
      };
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
Schema.statics.uploadFile = async function ({ file, user_id }) {
  try {
    return new Promise((resolve, reject) => {
      const _this = this;
      const { originalname, size, mimetype, fieldname } = file;

      const timestamp = Math.floor(Date.now() / 1000);
      const rawName = Buffer.from(originalname, 'latin1').toString('utf-8');
      const filename = `${timestamp}-${rawName}`;

      const bucket = storage.bucket(cloud_storage_bucket);
      const gcsFile = bucket.file(filename);
      const stream = gcsFile.createWriteStream({
        metadata: {
          contentType: mimetype,
        },
      });
      stream.on('error', (err) => {
        console.error(err);
        return null;
      });
      stream.on('finish', async () => {
        const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        const { _doc } = await _this.insert({
          body: {
            name: rawName,
            filename,
            size,
            mimetype,
            url,
          },
          user_id,
        });
        if (_doc && _doc._id) {
          resolve({
            _id: new mongoose.Types.ObjectId(_doc._id),
            fieldname,
          });
        } else {
          reject(new Error(`Could not insert ${filename} file`));
        }
      });
      stream.end(file.buffer);
    });
  } catch (err) {
    console.error(err);
    return null;
  }
};

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
  title,
};
