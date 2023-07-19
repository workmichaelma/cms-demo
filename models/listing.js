const qs = require('qs');
const { isEmpty, map, reduce } = require('lodash');

const handleQuery = (req) => {
  const filters = {};
  const queryObject = qs.parse(req.query);
  if (queryObject.filters) {
    queryObject.filters.split(',').forEach((filter) => {
      const [field, value] = filter.split('^');
      const operator = value.startsWith('=')
        ? '$eq'
        : value.startsWith('>')
        ? '$gt'
        : value.startsWith('>=')
        ? '$gte'
        : value.startsWith('<')
        ? '$lt'
        : value.startsWith('<=')
        ? '$lte'
        : value.startsWith('~=')
        ? '$regex'
        : '$eq';
      const _parsedValue =
        value.startsWith('>=') ||
        value.startsWith('<=') ||
        value.startsWith('~=')
          ? value.slice(2)
          : value.startsWith('=') ||
            value.startsWith('<') ||
            value.startsWith('>')
          ? value.slice(1)
          : value;
      const parsedValue = field.endsWith('_id')
        ? new mongoose.Types.ObjectId(_parsedValue)
        : field.endsWith('_date') || field === 'dob'
        ? new Date(_parsedValue)
        : _parsedValue === 'true'
        ? true
        : _parsedValue === 'false'
        ? false
        : operator === '$regex'
        ? new RegExp(_parsedValue, 'i')
        : _parsedValue;

      filters[field] = { [operator]: parsedValue };
    });
  }
  return {
    filters,
    queryObject,
  };
};

const buildPipeline = ({
  searchPipeline = [],
  projectionPipeline = [],
  fieldsToDisplay,
  queryObject,
  filters,
}) => {
  const { sort } = queryObject;
  const page = parseInt(queryObject?.page) || 1;
  const pageSize = parseInt(queryObject?.pagesize) || 50;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;
  let pipeline = [];
  console.log({ filters });
  if (!isEmpty(filters)) {
    pipeline.push({
      $match: {
        $and: map(filters, (filter, key) => {
          return { [key]: filter };
        }),
      },
    });
  }
  if (!isEmpty(searchPipeline)) {
    pipeline = [...pipeline, ...searchPipeline];
  }
  const projection = fieldsToDisplay.reduce((fields, field) => {
    fields[field] = `$${field}`;
    return fields;
  }, {});
  console.log(pipeline);
  projectionPipeline.push({
    $project: projection,
  });

  if (sort) {
    const sortFieldMatch = sort.split('=');
    if (sortFieldMatch.length === 2) {
      const [first, second] = sortFieldMatch[1].split('-');
      const order = second ? -1 : 1;
      pipeline.push({
        $facet: {
          records: [
            ...projectionPipeline,
            { $sort: { [second || first]: order } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: 'count' }],
        },
      });
    }
  } else {
    pipeline.push({
      $facet: {
        records: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          { $skip: skip },
          { $limit: limit },
          ...projectionPipeline,
        ],
        totalCount: [{ $count: 'count' }],
      },
    });
  }
  return {
    pipeline,
    page,
    pageSize: limit,
  };
};

const aggregate = async ({
  searchPipeline = [],
  projectionPipeline = [],
  customFilterFields = [],
  fieldsToDisplay,
  queryObject,
  filters,
  _this,
}) => {
  try {
    const { pipeline, page, pageSize } = buildPipeline({
      searchPipeline,
      projectionPipeline,
      fieldsToDisplay,
      queryObject,
      filters: reduce(
        filters,
        (prev, curr, key) => {
          if (!customFilterFields.includes(key)) {
            prev[key] = curr;
          }
          return prev;
        },
        {}
      ),
    });
    const result = await _this.aggregate(pipeline);
    if (result) {
      const [{ records, totalCount }] = result || {};

      const count = !isEmpty(records) ? totalCount[0]?.count : 0;

      return {
        data: {
          records,
          metadata: {
            total: count,
            page,
            pageSize,
            hasNextPage: (page - 1) * pageSize + records?.length < count,
            hasPrevPage: page > 1,
            pipeline,
          },
        },
      };
    } else {
      throw new Error(`Failed to get aggregate result.`);
    }
  } catch (err) {
    console.error(err, searchPipeline, projectionPipeline);
    return null;
  }
};
module.exports = {
  handleQuery,
  aggregate,
};
