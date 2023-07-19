ObjectID = require('mongodb').ObjectID;

const crypto = require(_base + 'app/helpers/crypto');
const res = require('express/lib/response');
const nodemailer = require('nodemailer');

class Model {
	req = null;
	res = null;
	table = null;
	schema = [];
	media = null;
	logs = null;

	constructor(req, res, table) {
		this.req = req;
		this.res = res;
		this.table = table;

		if (this.table != 'media' && this.table != 'admin_logs') {
			let Media = require(_base + 'app/models/media');
			this.media = new Media(req, res);

			let Logs = require(_base + 'app/models/system/logs');
			this.logs = new Logs(req, res);
		}
	}

	async get(where, extra_aggregates = [], populate = '') {
		try {
			let aggregates = [];

			aggregates = this.query_relations(aggregates);
			aggregates = this.query_where(aggregates, where);
			aggregates = aggregates.concat(extra_aggregates);
			aggregates.push({ $limit: 1 });
			// console.log(aggregates);

			let doc = await this.req.db
				.collection(this.table)
				.aggregate(aggregates)
				.toArray();
			console.log({ doc });
			if (doc.length > 0) {
				doc = doc[0];

				doc = this.query_relations_order(doc, this.schema);
				doc = this.populate_media(doc);

				return doc;
			} else {
				return null;
			}
		} catch (err) {
			console.error(err);
			this.req.session.toasts.push({ type: 'error', msg: err });
			return false;
		}
	}

	/*
    where: find query
    option:
      pageIndex (default 1)
      pageSize (integer 20)
      sortField (field name)
      sortOrder (asc, desc)
  */
	async lists(where, option, custom = null) {
		try {
			let aggregates = [];

			aggregates = this.query_relations(aggregates);
			aggregates = this.query_where(aggregates, where);
			aggregates = this.query_sort(aggregates, option);
			aggregates = this.query_limit(aggregates, option);
			if (custom) {
				aggregates.push(custom);
			}

			const docs = await this.req.db
				.collection(this.table)
				.aggregate(aggregates)
				.toArray();

			return docs.map((doc) => {
				return this.query_relations_order(doc, this.schema);
			});
		} catch (err) {
			console.error(err);
			this.req.session.toasts.push({ type: 'error', msg: err });
			return false;
		}
	}

	async lists_count(where, option) {
		try {
			let aggregates = [];

			aggregates = this.query_where(aggregates, where);
			aggregates.push({
				$count: 'count',
			});

			let docs = await this.req.db
				.collection(this.table)
				.aggregate(aggregates)
				.toArray();
			if (docs[0]) return docs[0].count;
			return 0;
		} catch (err) {
			console.error(err);
			this.req.session.toasts.push({ type: 'error', msg: err });
			return false;
		}
	}

	populate_media(doc) {
		for (let r in this.schema) {
			if (this.schema[r].type == 'upload') {
				if (!Array.isArray(doc[r]) && doc[r]) {
					doc[r] = [doc[r]];
				}

				for (let v in doc[r]) {
					if (doc[r][v]) {
						let url = this.req.config.base_url + 'media/';

						doc[r][v] = {
							url: url + doc[r][v],
							value: doc[r][v],
						};
					}
				}
			}
		}

		return doc;
	}

	async prepare_value(value, files) {
		//upload files
		if (files) {
			for (let v in files) {
				if (this.schema[v] && this.schema[v].type == 'upload') {
					let media_id = await this.media.upload(this.schema[v], files[v]);

					if (this.schema[v].is_multiple) {
						if (!value[v]) {
							value[v] = [];
						}

						if (!Array.isArray(value[v])) {
							value[v] = [value[v]];
						}

						value[v] = value[v].concat(media_id);
					} else {
						value[v] = media_id;
					}
				}
			}
		}

		// loop all value with schema
		for (let v in value) {
			v = v.split(':'); // seperate table fields
			v = v[0];
			let temp;

			if (this.schema[v]) {
				switch (this.schema[v].type) {
					case 'status':
						if (value[v] == 1) value[v] = true;
						else value[v] = false;
						break;
					case 'upload':
						if (value[v] == undefined) {
							value[v] = null;
						}
						break;
					case 'relation':
						if (typeof value[v] == 'object') {
							for (let vv in value[v]) {
								if (value[v][vv] != 0) value[v][vv] = ObjectID(value[v][vv]);
							}
						} else {
							if (value[v] != 0) value[v] = ObjectID(value[v]);
						}
						break;
					case 'date':
						temp = value[v].toString().trim();
						if (temp != '') value[v] = new Date(temp);
						else value[v] = null;
						break;
					case 'boolean':
						value[v] = value[v] == 1 ? true : false;
						break;
					case 'number':
						if (!value[v].toString().trim()) {
							value[v] = null;
						} else {
							value[v] = parseFloat(value[v].toString().trim());
						}

						break;
					case 'password':
						if (value[v]) {
							value[v] = crypto.encrypt(value[v]);
						} else {
							delete value[v];
						}
						break;
					case 'table':
						let main_array = [];
						for (let k in this.schema[v].values) {
							let key = v + ':' + k;
							let i = -1;

							for (let vv in value[key]) {
								if (i >= 0) {
									if (main_array[i] == undefined) main_array[i] = {};
									main_array[i][k] = value[key][vv];
								}
								i++;
							}
							delete value[key];
						}
						value[v] = main_array;
						break;
					default:
						temp = value[v].toString().trim();
						if (temp == '') temp = null;
						value[v] = temp;
						break;
				}
			} else {
				//not exist in schema
				// delete value[v];
				temp = value[v].toString().trim();
				if (temp == '') temp = null;
				value[v] = temp;
			}
		}

		return value;
	}

	query_where(aggregates, where) {
		if (where) {
			aggregates.push({
				$match: where,
			});
		}

		return aggregates;
	}

	query_relations(aggregates) {
		for (let s in this.schema) {
			if (this.schema[s].type == 'relation') {
				let temp = {
					$lookup: {
						from: this.schema[s].foreign,
						localField: this.schema[s].local_field
							? this.schema[s].local_field
							: s,
						foreignField: this.schema[s].foreign_field
							? this.schema[s].foreign_field
							: '_id',
						as: s + '_mapped',

						// localField: this.schema[s].relation_type == 'has_many' ? '_id' : s,
						// foreignField: this.schema[s].relation_type == 'has_many' ? this.schema[s].foreign_field : '_id',
						// as: (this.schema[s].relation_type == 'has_many' ? this.schema[s].foreign : s) + '_mapped'
					},
				};
				aggregates.push(temp);
			}
		}

		return aggregates;
	}

	query_relations_order(record, schema) {
		for (let s in schema) {
			if (record[s] && schema[s].type == 'relation') {
				if (schema[s].is_multiple && Array.isArray(record[s])) {
					for (let i in record[s]) {
						for (let x in record[s + '_mapped']) {
							if (
								record[s + '_mapped'][x]['_id'].toString() ==
								record[s][i].toString()
							) {
								record[s][i] = record[s + '_mapped'][x];
							}
						}
					}
				} else {
					record[s] = record[s + '_mapped'];
				}

				delete record[s + '_mapped'];
			}
		}
		return record;
	}

	query_limit(aggregates, option) {
		if (option && option.pageSize && option.pageIndex) {
			let temp = {
				$skip: (parseInt(option.pageIndex) - 1) * parseInt(option.pageSize),
			};
			aggregates.push(temp);

			temp = {
				$limit: parseInt(option.pageSize),
			};
			aggregates.push(temp);
		}
		return aggregates;
	}

	query_sort(aggregates, option) {
		if (option && option.sortField) {
			let temp = {
				$sort: { [option.sortField]: option.sortOrder == 'asc' ? 1 : -1 },
			};
			aggregates.push(temp);
		}
		return aggregates;
	}

	field_filter(key, value) {
		let temp;
		if (this.schema[key]) {
			switch (this.schema[key].type) {
				case 'status':
					temp = value == '1' ? true : false;
					return { $eq: temp };
				case 'relation':
					if (value && value != '0') {
						if (ObjectID.isValid(value)) {
							return { $in: [ObjectID(value)] };
						} else {
							return { $regex: new RegExp(value, 'i') };
						}
					} else return null;
				case 'date':
					temp = {};
					let flag = false;
					if (value['from']) {
						value = new Date(value['from'].toString().trim());
						temp['$gte'] = value;
						flag = true;
					}
					if (value['to']) {
						value = new Date(value['to'].toString().trim());
						temp['$lte'] = value;
						flag = true;
					}
					if (flag) return temp;
					else return null;
				case 'boolean':
					value = value == 'true' ? true : false;
					return { $eq: value };
				case 'number':
					value = parseFloat(value.toString().trim());
					return { $eq: value };
				case 'select':
					if (value != 0) return { $eq: value };
					break;
				default:
					return { $regex: value, $options: 'i' };
			}
		} else {
			// not exist in schema
			// return null;
			return { $regex: value, $options: 'i' };
		}
	}

	load_standard_schema(status_flag = true) {
		if (status_flag) {
			this.schema.status = {
				title: 'Status',
				type: 'status',
			};
			this.schema.online_date = {
				title: 'Online Date',
				type: 'date',
			};
			this.schema.offline_date = {
				title: 'Offline Date',
				type: 'date',
			};
		}

		this.schema.created_at = {
			title: 'Created At',
			type: 'date',
		};
		this.schema.created_by = {
			title: 'Created By',
			type: 'relation',
			foreign: 'admin_users',
			foreign_label: 'name',
		};

		this.schema.updated_at = {
			title: 'Updated At',
			type: 'date',
		};
		this.schema.updated_by = {
			title: 'Updated By',
			type: 'relation',
			foreign: 'admin_users',
			foreign_label: 'name',
		};
	}

	async create(value, files) {
		value = await this.prepare_value(value, files);
		value.created_at = new Date();

		if (this.req.session.admin_id) {
			value.created_by = ObjectID(this.req.session.admin_id);
		}

		try {
			let record = await this.req.db.collection(this.table).insertOne(value);

			await this.logs.log(this.table, '1', record.ops[0]._id, null, value);

			this.req.session.toasts.push({ type: 'success', msg: 'Create success.' });
			return record.ops[0]._id;
		} catch (err) {
			console.error(err);
			this.req.session.toasts.push({ type: 'error', msg: err });
			return false;
		}
	}

	async update(where, value, files) {
		value = await this.prepare_value(value, files);
		value.updated_at = new Date();

		if (this.req.session.admin_id) {
			value.updated_by = ObjectID(this.req.session.admin_id);
		}

		try {
			// console.log(value);
			let old_value = await this.req.db.collection(this.table).findOne(where);
			//console.log(old_value);
			await this.req.db
				.collection(this.table)
				.updateOne(where, { $set: value });
			await this.logs.log(this.table, '2', where._id, old_value, value);

			this.req.session.toasts.push({ type: 'success', msg: 'Update success.' });
			return true;
		} catch (err) {
			console.error(err);
			this.req.session.toasts.push({ type: 'error', msg: err });
			return false;
		}
	}

	async delete(where) {
		try {
			await this.req.db.collection(this.table).deleteMany(where);

			await this.logs.log(this.table, '3', where._id.$in, null, null);

			this.req.session.toasts.push({ type: 'success', msg: 'Delete success.' });
			return true;
		} catch (err) {
			console.error(err);
			this.req.session.toasts.push({ type: 'error', msg: err });
			return false;
		}
	}

	async migrate_map_csv(csvdata, db) {
		for (let r in csvdata) {
			for (let s in this.schema) {
				let temp_s = this.schema[s];
				if (
					csvdata[r][s] != '' &&
					csvdata[r][s] != undefined &&
					s != 'created_by' &&
					s != 'updated_by' &&
					temp_s.type == 'relation'
				) {
					let temp_check = this.migrate_map_csv_regex(csvdata[r][s]);

					let db_findone = {};
					let db_findone2 = {};
					db_findone[temp_s.foreign_label] = new RegExp(
						'^' + temp_check + '$',
						'i'
					);
					db_findone2[temp_s.foreign_label] = new RegExp(
						'^' + temp_check + '$',
						'i'
					);

					if (s == 'unit') {
						db_findone['project'] = csvdata[r]['project'];
						// console.log(db_findone);
					}

					if (s == 'landlord1') {
						if (csvdata[r]['landlord1_contact'] != '') {
							temp_check = this.migrate_map_csv_regex(
								csvdata[r]['landlord1_contact']
							);
							db_findone2['contact_number'] = new RegExp(
								'^' + temp_check + '$',
								'i'
							);
						}
					}

					if (s == 'tenant1') {
						if (csvdata[r]['tenant1_contact'] != '') {
							temp_check = this.migrate_map_csv_regex(
								csvdata[r]['tenant1_contact']
							);
							db_findone2['contact_number'] = new RegExp(
								'^' + temp_check + '$',
								'i'
							);
						}
					}
					if (s == 'tenant2') {
						if (csvdata[r]['tenant2_contact'] != '') {
							temp_check = this.migrate_map_csv_regex(
								csvdata[r]['tenant2_contact']
							);
							db_findone2['contact_number'] = new RegExp(
								'^' + temp_check + '$',
								'i'
							);
						}
					}
					if (s == 'tenant3') {
						if (csvdata[r]['tenant3_contact'] != '') {
							temp_check = this.migrate_map_csv_regex(
								csvdata[r]['tenant3_contact']
							);
							db_findone2['contact_number'] = new RegExp(
								'^' + temp_check + '$',
								'i'
							);
						}
					}

					if (s == 'agent') {
						if (csvdata[r]['agent_contact'] != '') {
							temp_check = this.migrate_map_csv_regex(
								csvdata[r]['agent_contact']
							);
							db_findone2['contact_number'] = new RegExp(
								'^' + temp_check + '$',
								'i'
							);
						}
					}

					let relation_record = await db
						.collection(temp_s.foreign)
						.find(db_findone)
						.toArray();
					if (relation_record.length == 0) {
						console.log(
							'--- relation error: row: ' +
								(parseInt(r) + 2) +
								' | ' +
								temp_s.foreign +
								' | ' +
								temp_s.foreign_where +
								' | ' +
								csvdata[r][s] +
								' | ' +
								db_findone[temp_s.foreign_label] +
								' ---'
						);
						csvdata[r][s] = null;
					} else if (relation_record.length == 1) {
						csvdata[r][s] = relation_record[0]._id;
					} else {
						console.log(
							'--- relation multi find: ' +
								(parseInt(r) + 2) +
								' | ' +
								temp_s.foreign +
								' | ' +
								temp_s.foreign_where +
								' | ' +
								csvdata[r][s] +
								' | ' +
								db_findone[temp_s.foreign_label] +
								' ---'
						);
						relation_record = await db
							.collection(temp_s.foreign)
							.findOne(db_findone2);

						if (!relation_record) {
							console.log(
								'--- relation error: row: ' +
									(parseInt(r) + 2) +
									' | ' +
									temp_s.foreign +
									' | ' +
									temp_s.foreign_where +
									' | ' +
									csvdata[r][s] +
									' | ' +
									db_findone2[temp_s.foreign_label] +
									' | ' +
									db_findone2['contact_number'] +
									' ---'
							);
							csvdata[r][s] = null;
						} else {
							csvdata[r][s] = relation_record._id;
						}
					}
				} else if (typeof csvdata[r][s] == 'string') {
					csvdata[r][s] = csvdata[r][s].trim();
				}
			}
		}

		return csvdata;
	}

	migrate_map_csv_regex(value) {
		let temp_check = value.trim().replace(/\//g, '\\/');
		temp_check = temp_check.replace(/\(/g, '\\(');
		temp_check = temp_check.replace(/\)/g, '\\)');
		temp_check = temp_check.replace(/\+/g, '\\+');
		temp_check = temp_check.replace(/\$/g, '\\$');
		temp_check = temp_check.replace(/\?/g, '\\?');
		// temp_check = temp_check.replace(/\-/g, "\\-)")

		return temp_check;
	}

	async send_email(
		record,
		template_name,
		attachments = [],
		to_emails = [],
		cc_emails = []
	) {
		const Email_template = require(_base + 'app/models/email_template');
		const model_email_template = new Email_template(this.req, this.res);

		let email_template = await model_email_template.get({
			template_key: template_name,
		});

		for await (let attachment of email_template.attachments || []) {
			const attachment_content = await this.req.storage
				.file(attachment.value)
				.download();
			attachments.push({
				content: attachment_content[0],
				filename: attachment.value,
			});
		}

		model_email_template.setModel(this);

		let subject = model_email_template.parse(
			record,
			email_template.email_subject
		);
		let content = model_email_template.parse(
			record,
			email_template.email_content
		);

		var transporter = nodemailer.createTransport({
			host: 'send.smtp.com',
			port: 2525,
			auth: {
				user: 'tsrpms',
				pass: 'C6eh2CBY',
			},
		});

		var mailOptions = {
			from: email_template.email_from,
			to: email_template.email_to ? email_template.email_to : to_emails,
			cc: email_template.email_cc,
			bcc: email_template.email_bcc,
			subject: subject,
			html: content,
			attachments: attachments,
		};

		return new Promise((resolve, reject) => {
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					console.log('Email sent: ' + info.response);
					resolve(true);
				}
			});
		});
	}

	getEmailVars(record = null) {
		return {};
	}

	getEmailVarsRemark() {
		return {};
	}
}

module.exports = Model;
