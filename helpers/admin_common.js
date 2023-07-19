module.exports = {
    lists_key_convert: function(model, query) {
        let where = {}, option = {};
        for (let key in query) {
            if (key == 'pageIndex' || key == 'pageSize' || key == 'sortField' || key == 'sortOrder' || key == 'pageCount') {
                option[key] = query[key];
            } else if (query[key]) {
                let temp = model.field_filter(key, query[key]);
                if (temp) {
                    if (model.schema[key] && model.schema[key].type == 'relation' && !ObjectID.isValid(query[key])) {
                        where[key + '_mapped.' + model.schema[key].foreign_label] = temp;
                    } else {
                        where[key] = temp;
                    }
                }
            }
        }

        return {where, option};
    },
    calculate_period(check_date, contract_start_date, contract_end_date) {
        check_date = new Date(check_date);
        check_date = new Date(check_date.getFullYear(), check_date.getMonth(), 1, 0, 0, 0);
        // console.log('check_date', check_date);

        //get month last day
        let start_month = new Date(check_date);
        start_month.setMonth(start_month.getMonth()+1);
        start_month.setDate(0);
        let month_last_day = start_month.getDate(); 
        let start_date = contract_start_date.getDate();

        let period_from = null;
        let period_to = null;
        if (month_last_day - start_date >= 0) {
            period_from = new Date(check_date.getFullYear(), check_date.getMonth(), start_date, 0, 0, 0);
        } else {
            period_from = new Date(check_date.getFullYear(), check_date.getMonth(), month_last_day, 0, 0, 0);
        }
        
        if (start_date == 1) {
            period_to = new Date(check_date.getFullYear(), check_date.getMonth(), month_last_day, 0, 0, 0);
        } else {
            let end_month = new Date(check_date);
            end_month.setMonth(end_month.getMonth()+2);
            end_month.setDate(0);
            month_last_day = end_month.getDate()
            let end_date = contract_end_date.getDate();
            
            // console.log('month last day', month_last_day, end_date);
            if (month_last_day - end_date >= 0) {
                period_to = new Date(check_date.getFullYear(), check_date.getMonth()+1, end_date, 0, 0, 0);
            } else {
                period_to = new Date(check_date.getFullYear(), check_date.getMonth()+1, month_last_day-1, 0, 0, 0);
            }
        }
        
        return [period_from, period_to]
    }
}