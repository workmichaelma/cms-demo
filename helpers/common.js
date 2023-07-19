const { clone, forEach, isNumber, isEmpty, reduce } = require('lodash');
const dayjs = require('dayjs');

const isISODateString = (str) => {
	try {
		const day = new Date(str);
		return day.toISOString() === str;
	} catch {
		return false;
	}
};
const toISOString = (str) => {
	try {
		if (str) {
			const day = dayjs(str);
			if (day.isValid()) {
				return day.toISOString();
			}
		}
		return undefined;
	} catch {
		return undefined;
	}
};

const withVehicleField = {
	chassis_number: '底盤號碼',
	print_number: '車身編號',
	reg_mark: '車牌',
};

const withContractField = {
	contract_number: '合約編號',
};

const withSchemaField = (schema, fields) => {
	const _schema = {
		...schema,
		status: {
			title: '狀況',
		},
	};
	return reduce(
		fields,
		(result, field) => {
			result[field] = _schema[field]?.title || field;
			return result;
		},
		{}
	);
};

const withProfileFieldsToDisplay = (schema, exclude = []) => {
	return Object.keys(schema).filter((v) => {
		return !exclude.includes(v) && !schema[v]?.child;
	});
};

const withVehicleImportSchema = ({ exclude }) => {
	const schema = {
		vehicle: {
			type: 'text',
			title: 'Vehicle Number',
			is_required: true,
			tooltip: {},
		},
		vehicle_effective_date: {
			title: 'Vehicle Effective Date',
			is_short_date: true,
			tooltip: { format: 'YYYY-MM-DD', example: '2023-04-05' },
		},
		vehicle_end_date: {
			title: 'Vehicle End Date',
			is_short_date: true,
			tooltip: { format: 'YYYY-MM-DD', example: '2023-04-05' },
		},
	};
	forEach(exclude, (field) => {
		delete schema[field];
	});
	return schema;
};

module.exports = {
	isISODateString,
	withVehicleField,
	withContractField,
	withProfileFieldsToDisplay,
	withSchemaField,
	withVehicleImportSchema,
	random_string: function (length) {
		var result = '';
		var characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	object_map_key: function (values) {
		let results = {};
		for (let i = 0; i < values.length; i++) {
			if (typeof values[i] == 'object') results[values[i]._id] = values[i];
		}

		return results;
	},
	set_excel_cell: function (ws, cell, to, value, border) {
		ws.getCell(cell).value = value;

		let border_object = {};

		if (border[0] == 1) border_object.top = { style: 'thin' };
		else if (border[0] == 2) border_object.top = { style: 'medium' };

		if (border[1] == 1) border_object.right = { style: 'thin' };
		else if (border[1] == 2) border_object.right = { style: 'medium' };

		if (border[2] == 1) border_object.bottom = { style: 'thin' };
		else if (border[2] == 2) border_object.bottom = { style: 'medium' };

		if (border[3] == 1) border_object.left = { style: 'thin' };
		else if (border[3] == 2) border_object.left = { style: 'medium' };

		ws.getCell(cell).border = border_object;
		ws.mergeCells(cell + ':' + to);
	},
	checkFieldIsValid: function ({ schema, args }) {
		const error = {};
		const fields = clone(args);
		forEach(schema, (obj, field) => {
			const value = args[field];
			if (field === 'status') return;
			if (obj.is_required && isEmpty(value)) {
				error[field] = `[ ${field} ] cannot be null`;
			} else if (!isEmpty(value)) {
				if (obj.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
					error[field] = `Expected date format. value: ${value}`;
				}
				if (
					obj.type === 'number' &&
					!/^[-]?\d{1,}(,\d{3})*(\.\d+)?$/.test(value)
				) {
					error[field] = `Expected number value. Value: ${value}`;
				}
			}
		});

		forEach(args, (v, k) => {
			if (k.endsWith('_date') && !isEmpty(v)) {
				if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
					error[k] = `Expected date format. Value: ${v}`;
				} else {
					fields[k] = toISOString(v);
				}
			}
			if (schema[k]?.type === 'number') {
				fields[k] = v.replace(/,/g, '');
			}
		});
		return {
			error,
			fields,
		};
	},
};
