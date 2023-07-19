const route = require('express').Router();
const admin_common = require(_base+'app/helpers/admin_common');
const Users = require(_base+'app/models/system/users');
const Main = require(_base+'app/models/system/ips');
let main;
const view_path = 'admin/system/ips/';

route.use(function (req, res, next) {
  res.view.menu = 'system_ips';
  res.view.title = 'IP allow';
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

route.get('/new', function (req, res) {
  if (users.check_permission(main.table, 2)) {
    res.render(view_path+'detail', res.view);
  }
});

route.post('/new', async function (req, res) {
  if (users.check_permission(main.table, 2)) {
    id = await main.create(req.body, req.files);
    if (id)
      res.redirect(302, '/'+view_path+id);
    else
      res.redirect(302, '/'+view_path);
  }
});

route.post('/delete', async function (req, res) {
  if (users.check_permission(main.table, 2)) {
    let ids = req.body.ids.split(',');
    for (let i = 0; i < ids.length; i++) {
      ids[i] = ObjectID(ids[i]);
    }
    await main.delete({_id:{$in:ids}});
    res.redirect(302, '/'+view_path);
  }
});

route.get('/:id', async function (req, res) {
  let record = await main.get({_id: ObjectID(req.params.id)});
  
  if (record) {
    res.view.record = record;
    res.render(view_path+'detail', res.view);
  } else
    res.redirect(302, '/'+view_path);
});

route.post('/:id', async function (req, res) {
  if (users.check_permission(main.table, 2)) {
    await main.update({_id: ObjectID(req.params.id)}, req.body, req.files);
    res.redirect(302, '/'+view_path+req.params.id);
  }
});

module.exports = route;
