const Model = require(_base+'app/models/model');

class Configuration extends Model {
  constructor(req, res) {
    super(req, res, 'admin_config');

    this.schema = {
      project_title: {
        title: 'Project Title',
        type: 'text',
        is_required: true
      },

      currency_unit: {
        title: 'Currency Unit',
        type: 'text',
        is_required: true
      },
      holding_taxes: {
        title: 'Holding Taxes (%)',
        type: 'number',
        is_required: true
      },
      hst: {
        title: 'HST (%)',
        type: 'number',
        is_required: true
      },
      default_due_day: {
        title: 'Payment Due Day(s)',
        type: 'number',
        is_required: true
      },
      overdue_notice_day: {
        title: 'Overdue Email Notice every Day(s)',
        type: 'number',
        is_required: true
      },
      // session_timeout: {
      //   title: 'Session Timeout (mins)',
      //   type: 'number',
      //   is_required: true
      // }
    }

    
    this.load_standard_schema(false);
  }

  async get_config() {
    let r = await this.get({_id: ObjectID('5f11f4b13734ed5861cf5152')});
    return r;
  }
}

module.exports = Configuration;
