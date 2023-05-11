import React from 'react';
import { DatePicker } from 'antd';
import { filterPropType } from './propTypes';
import { immutableCompare, prefixClass } from './../utils';
import moment from 'moment';
const { RangePicker } = DatePicker;

export default class DateFilter extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        if (!immutableCompare(this.props.filterValue, nextProps.filterValue)) {
            return true;
        }
        return false;
    }

    onChange = (dates, dateStrings) => {
        this.props.setFilterValue(dates)
    }

    render() {

        const { filterValue = [] } = this.props;

        return (
            <div>
                <div className={prefixClass('header-cell--dropdown-content')}>
                    <RangePicker
                        format='YYYY-MM-DD'
                        ranges={{
                            '今天': [moment(), moment()],
                            '最近7天': [moment(new Date()).subtract(7, 'days'), moment()],
                            '最近30天': [moment(new Date()).subtract(30, 'days'), moment()],
                            '最近45天': [moment(new Date()).subtract(45, 'days'), moment()],
                            '最近3个月': [moment(new Date()).subtract(3, 'months'), moment()],
                            '最近6个月': [moment(new Date()).subtract(6, 'months'), moment()],
                            '最近1年': [moment(new Date()).subtract(1, 'years'), moment()],
                        }}
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                        onChange={this.onChange}
                        value={filterValue}
                    />
                </div>
                <div className={prefixClass('header-cell--dropdown-btns')} style={{textAlign: 'right'}}>
                    <a
                        onClick={() => this.props.confirm()}
                        className={prefixClass('header-cell--dropdown-btns-confirm')}
                    >确定</a>
                    <a
                        onClick={() => this.props.clearFilter()}
                        className={prefixClass('header-cell--dropdown-btns-clear')}
                    >重置</a>
                </div>
            </div>
        )
    }
}

DateFilter.propTypes = {
    ...filterPropType
};