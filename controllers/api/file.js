const route = require('express').Router();

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/file');

const collection_name = COLLECTIONS.FILE;

route.get('/:name(*)', async (req, res) => {
  try {
    const { name } = req.params;
    const _doc = await __MODEL__.Model.findOne({ name });

    if (_doc && _doc.filename) {
      const file = await __MODEL__.Model.getFile({ filename: _doc.filename });
      if (file && file.contentType && file.data) {
        res.contentType(file.contentType);
        res.end(file.data);
      } else {
        throw new Error(`File Not Found: ${name}`);
      }
    } else {
      throw new Error(`File Not Found: ${name}`);
    }
  } catch (err) {
    console.error(`/app/controllers/api/${collection_name}/:name`, err);
    res.status(404).send(null);
  }
});

module.exports = route;
