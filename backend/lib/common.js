import lodash from "lodash";
const { clone, isBoolean, isNaN, isUndefined, find } = lodash

export const checkFieldIsValidToSchema = ({ schema, args }) => {
  const error = {};
  const obj = clone(args);
  forEach(obj, (value, field) => {
    const config = find(schema, { field })

    if (config && !isUndefined(value)) {
      switch (config.type) {
        case "boolean":
          if (!isBoolean(value)) {
            error[field] = `[ ${field} ], Expected boolean value. Value: ${value}`
          }
          return
        case "date":
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            error[field] = `[ ${field} ], Expected date format. Value: ${value}`;
          } else {
            obj[field] = toISOString(value);
          }
          return
        case "number":
          const numberValue = toNumber(value.replace(/,/g, ''));
          if (!isNaN(numberValue)) {
            obj[field] = numberValue;
          } else {
            error[field] = `[ ${field} ], Expected number format. Value: ${value}`;
          }
          break
        default:
          break;
      }

      if (config.is_required && isUndefined(value)) {
        error[field] = `[ ${field} ] cannot be null`;
      }
    }
  });
  return {
    error,
    fields,
  };
}