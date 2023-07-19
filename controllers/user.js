const router = require('express').Router();
const { isEmpty } = require('lodash');
const multer = require('multer');
const upload = multer();
const Ips = require(_base + 'app/models/system/ips');

const User = require(_base + 'app/models/user');

router.post('/register', upload.any(), async function (req, res) {
  const { is_admin = false, logged_in = false, user_id } = req.session || {};
  if ((!is_admin || !logged_in || !user_id) && false) {
  } else {
    try {
      const { username, password } = req.body || {};
      if (username && password) {
        const { err } = await User.Model.register({
          username,
          password,
          user_id,
        });

        if (err) {
          throw new Error(err);
        } else {
          res.json({ ok: true });
        }
      } else {
        throw new Error('Please insert valid Username / Password');
      }
    } catch (err) {
      console.log(`Failed to Register user, reason: ${err}`);
      res.json({ ok: false });
    }
  }
});

router.post('/login', upload.any(), async function (req, res) {
  let ok = req.session.logged_in;
  console.log({ req });
  try {
    if (!ok) {
      const user = await User.Model.login({
        username: JSON.parse(req.body.username),
        password: JSON.parse(req.body.password),
      });
      if (user) {
        ok = true;
        req.session.user_id = user._id;
        req.session.username = user.username;
        req.session.is_admin = user.is_admin;
        req.session.display_name = user.display_name;
        req.session.logged_in = true;
      }
    }
    res.json({ ok });
  } catch (err) {
    console.error(`/admin/login failed: `, err);
    res.json({ ok: false });
  }
});

router.post('/logout', upload.any(), function (req, res) {
  req.session.user_id = null;
  req.session.username = null;
  req.session.logged_in = false;
  res.json({ ok: true });
});

router.get('/profile', async (req, res) => {
  const { username, display_name, is_admin } = req.session;
  if (username) {
    res.json({
      username,
      display_name,
      is_admin,
    });
  } else {
    res.json(null);
  }
});

module.exports = router;
