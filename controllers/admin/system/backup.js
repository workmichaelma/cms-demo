const route = require('express').Router();
const admin_common = require(_base+'app/helpers/admin_common');
const Users = require(_base+'app/models/system/users');
const Main = require(_base+'app/models/system/backup');
let main;
const view_path = 'admin/system/backup/';
const fs = require('fs');

route.use(function (req, res, next) {
  res.view.menu = 'system_backup';
  res.view.title = 'Backup';
  res.view.view_path = view_path;
  
  main = new Main(req, res);
  res.view.schema = main.schema;

  users = new Users(req, res);
  if (users.check_permission(main.table, 1)) {
    next();
  }
});

route.get('/', function (req, res) {
  res.render(view_path+'lists', res.view);
});

route.get('/lists', async function (req, res) {
  let {where, option} = admin_common.lists_key_convert(main, req.query);
  let records = await main.lists(where, option);

  res.send({
    data: records,
  });
});

route.get('/lists_count', async function (req, res) {
  let {where, option} = admin_common.lists_key_convert(main, req.query);
  let count = await main.lists_count(where, option);
  
  res.send({
    count: count,
  });
});

route.get('/backup', function (req, res) {
  if (users.check_permission(main.table, 2)) {
    main.backup('2');
    res.redirect(302, '/'+view_path);
  }
});

route.get('/download/:id', async function (req, res) {
  let dir = './backup/';
  let record = await main.get({_id: ObjectID(req.params.id)});

  if (record) {
    if (fs.existsSync(dir + record.name)) {
      res.download(dir + record.name)
    } else {
      let file = req.storage.file('backup/' + record.name);
      let exist = await file.exists();

      if (exist) {
        res.setHeader('Content-disposition', 'attachment; filename=' + record.name);
        file.createReadStream().pipe(res);
        file.createReadStream().pipe(fs.createWriteStream(dir + record.name));
      } else 
        res.redirect(302, '/'+view_path);
    }  
  } else 
    res.redirect(302, '/'+view_path);
});

module.exports = route;
