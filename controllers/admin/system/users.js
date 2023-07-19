const route = require('express').Router();
const admin_common = require(_base+'app/helpers/admin_common');
const Users = require(_base+'app/models/system/users');
let users;
const view_path = 'admin/system/users/';

route.use(function (req, res, next) {
  res.view.menu = 'system_users';
  res.view.title = 'System - Users';
  res.view.view_path = view_path;

  users = new Users(req, res);
  res.view.schema = users.schema;
  
  if (users.check_permission(users.table, 1)) {
    next();
  }
});

route.get('/', function (req, res) {
  res.render(view_path+'lists', res.view);
});

route.get('/lists', async function (req, res) {
  let {where, option} = admin_common.lists_key_convert(users, req.query);
  let records = await users.lists(where, option);

  res.send({
    data: records,
  });
});

route.get('/lists_count', async function (req, res) {
  let {where, option} = admin_common.lists_key_convert(users, req.query);
  let count = await users.lists_count(where, option);
  
  res.send({
    count: count,
  });
});

route.get('/new', async function (req, res) {
  if (users.check_permission(users.table, 2)) {
    res.render(view_path+'detail', res.view);
  }
});

route.post('/new', async function (req, res) {
  if (users.check_permission(users.table, 2)) {
    id = await users.create(req.body, req.files);
    if (id)
      res.redirect(302, '/'+view_path+id);
    else
      res.redirect(302, '/'+view_path);
  }
});

route.get('/copy/:id', async function (req, res) {
  if (users.check_permission(users.table, 2)) {
    let record = await users.get({_id: ObjectID(req.params.id)});
    
    if (record) {
      delete record._id;
      res.view.record = record;
      res.render(view_path+'detail', res.view);
    } else
      res.redirect(302, '/'+view_path);
  }
});

route.post('/delete', async function (req, res) {
  if (users.check_permission(users.table, 2)) {
    let ids = req.body.ids.split(',');
    for (let i = 0; i < ids.length; i++) {
      ids[i] = ObjectID(ids[i]);
    }
    await users.delete({_id:{$in:ids}});
    res.redirect(302, '/'+view_path);
  }
});

route.get('/:id', async function (req, res) {
  let user = await users.get({_id: ObjectID(req.params.id)});
  if (user) {
    res.view.record = user;
    res.view.permission_values = {
      0: 'No access',
      1: 'Read',
      2: 'Write',
    };
    res.render(view_path+'detail', res.view);
  } else
    res.redirect(302, '/'+view_path);
});

route.post('/:id', async function (req, res) {
  if (users.check_permission(users.table, 2)) {
    await users.update({_id: ObjectID(req.params.id)}, req.body, req.files);
    res.redirect(302, '/'+view_path+req.params.id);
  }
});

module.exports = route;
