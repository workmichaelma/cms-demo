export const schema = [
	{
		field: 'username',
		title: 'Username',
		type: 'text',
		is_required: true,
	},
	{
		field: 'password',
		title: 'Password',
		type: 'text',
		is_required: true,
		is_password: true,
	},
	{
		field: 'display_name',
		title: 'Display Name',
		type: 'text',
		is_required: false,
	},
	{
		field: 'is_admin',
		title: 'Is Admin',
		type: 'boolean',
	},
	{
		field: 'permissions',
		title: 'Permission',
		type: 'text',
		is_multiple: true,
		checkbox: ['*', 'contract', 'company', 'vehicle', 'driver', 'reg_mark'],
		default: ['*'],
	},
]

// export const pageConfig = {
// 	pages: {
// 		listing: {
// 			fieldsToDisplay:
// 		}
// 	}
// }
