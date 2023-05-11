import React from 'react';
import { Radio } from 'antd';
import { filterPropType } from './propTypes';
import { immutableCompare, prefixClass } from './../utils';

export default class RadioFilter extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        const { filterOptions, filterValue } = this.props;
        if (!immutableCompare(filterOptions, nextProps.filterOptions) || !immutableCompare(filterValue, nextProps.filterValue)) {
            return true;
        }
        return false;
    }

    onChange = (e) => {
        this.props.setFilterValue([e.target.value])
    }

    render() {
        const { filterOptions = [], filterValue = [] } = this.props;
        return (
            <div>
                <div className={prefixClass('header-cell--dropdown-content')}>
                    {
                        filterOptions.map(item => (
                            <div key={item.key} className={prefixClass('header-cell--dropdown-select-item')}>
                                <Radio onChange={this.onChange} checked={filterValue.includes(item.key)} value={item.key}>
                                    {item.value}
                                </Radio>
                            </div>
                        ))
                    }
                </div>
                <div className={prefixClass('header-cell--dropdown-btns')}>
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

RadioFilter.propTypes = {
    ...filterPropType
};