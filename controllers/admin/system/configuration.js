const route = require('express').Router();
const Users = require(_base+'app/models/system/users');
const Main = require(_base+'app/models/system/configuration');
let main;
const view_path = 'admin/system/configuration/';
const id = '5f11f4b13734ed5861cf5152';

route.use(function (req, res, next) {
  res.view.menu = 'system_configuration';
  res.view.title = 'System - Configuration';
  
  main = new Main(req, res);
  res.view.schema = main.schema;

  users = new Users(req, res);
  if (users.check_permission(main.table, 1)) {
    next();
  }
});

route.get('/', async function (req, res) {
  let r = await main.get({_id: ObjectID(id)});

  res.view.record = r;
  res.render(view_path + 'detail', res.view);
});

route.post('/', async function (req, res) {
  if (users.check_permission(main.table, 2)) {
    await main.update({_id: ObjectID(id)}, req.body, req.files);
    res.redirect(302, '/'+view_path);
  }
});

module.exports = route;
