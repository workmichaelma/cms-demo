const route = require('express').Router();
const admin_common = require(_base+'app/helpers/admin_common');
const Users = require(_base+'app/models/system/users');
const Main = require(_base+'app/models/system/logs');
let main;
const view_path = 'admin/system/logs/';

route.use(function (req, res, next) {
  res.view.menu = 'system_logs';
  res.view.title = 'Logs';
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

route.get('/:id', async function (req, res) {
  let record = await main.get({_id: ObjectID(req.params.id)});
  
  if (record) {
    res.view.record = record;
    res.render(view_path+'detail', res.view);
  } else
    res.redirect(302, '/'+view_path);
});

module.exports = route;
