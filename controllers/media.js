const Users = require(_base+'app/models/system/users');
const router = require('express').Router();
var fs = require('fs');
var mime = require('mime');

router.get('^/:url(*)$', async function (req, res) {
  let file = req.storage.file(req.params.url);
  let exist = await file.exists();
  let is_public = await file.isPublic();

  if (exist[0]) {
    let metadata = await file.getMetadata();
    res.setHeader('Content-type', metadata[0].contentType);
    
    if (is_public[0]) {
      res.set('Cache-Control', req.config.media_cache);
      file.createReadStream().pipe(res);
      file.createReadStream().pipe(fs.createWriteStream(_base+'media/' + req.params.url));
    }
    else {
      // to-do project permission
      users = new Users(req, res);
      if (users.is_login()) {
        res.set('Cache-Control', 'must-revalidate, no-cache');
        file.createReadStream().pipe(res);
      } else {
        res.send('no permission')
      }
    }
  }
});

module.exports = router;
