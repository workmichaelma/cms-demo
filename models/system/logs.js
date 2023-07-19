const Model = require(_base+'app/models/model');

class Logs extends Model {
  constructor(req, res) {
    super(req, res, 'admin_logs');

    this.schema = {
      table: {
        title: 'Table',
        type: 'text',
      },
      type: {
        title: 'Type',
        type: 'select', 
        values: {
          1: 'Create',
          2: 'Update',
          3: 'Delete',
        },
      },
      related: {
        title: 'Related ID',
        type: 'text',
      },
      old_data: {
        title: 'Old Data',
        type: 'json',
      },
      data: {
        title: 'Data',
        type: 'json',
      },
      difference: {
        title: 'Difference',
        type: 'json',
      }
    }

    this.load_standard_schema(false);
  }

  async log(table, type, related, old_data, data) {
    if (this.req.session.admin_id && table != this.table) {
      if (old_data) {
        delete old_data._id;
        delete old_data.created_at;
        delete old_data.created_by;
        delete old_data.updated_at;
        delete old_data.updated_by;
      }

      if (data) {
        delete data._id;
        delete data.created_at;
        delete data.created_by;
        delete data.updated_at;
        delete data.updated_by;
      }

      let difference = {}
      if (old_data) {
        for (let i in data) {
          if (!(i in old_data) || old_data[i] != data[i]) {
            if (old_data[i] instanceof ObjectID && data[i] instanceof ObjectID) {
              if (!old_data[i].equals(data[i])) {
                difference[i] = {old: old_data[i], new: data[i]};
              }
            } else if (old_data[i] instanceof Date && data[i] instanceof Date) {
              if (old_data[i].getTime() != data[i].getTime()) {
                difference[i] = {old: old_data[i], new: data[i]};
              }
            } else {
              difference[i] = {old: old_data[i], new: data[i]};
            }
          }
        }
      }
      
      if (Object.keys(difference).length > 0) {
        let temp = {
          table: table,
          type: type,
          related: related,
          old_data: JSON.stringify(old_data),
          data: JSON.stringify(data),
          difference: JSON.stringify(difference),
          created_by: ObjectID(this.req.session.admin_id),
          created_at: new Date(),
        }
        
        await this.req.db.collection(this.table).insertOne(temp);   
      }
    }
  }

  async get_logs(table, related) {
    let records = await this.lists({
      table: table,
      related: related,
    }, {sortField: 'created_at', sortOrder: 'desc'});

    for (let i in records) {
      if (records[i].difference)
        records[i].difference = JSON.parse(records[i].difference)
    }

    // console.log(records)

    return records;
  }
}

module.exports = Logs;
