import React from 'react';
import { filterPropType } from './propTypes';
import { Select, Input } from 'antd';
import { immutableCompare, prefixClass } from './../utils';

const { Option } = Select;

export default class ConditionFilter extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        const { filterOptions, filterValue } = this.props;
        if (!immutableCompare(filterOptions, nextProps.filterOptions) || !immutableCompare(filterValue, nextProps.filterValue)) {
            return true;
        }
        return false;
    }

    render() {
        const { filterOptions, filterValue = [] } = this.props;

        return (
            <div>
                <div className={prefixClass('header-cell--dropdown-content')} style={{ width: '192px' }}>
                    <p>按条件过滤：</p>
                    <Select
                        style={{ width: "100%", marginBottom: 8, display: 'block' }}
                        value={filterValue[0] || filterOptions[0].value}
                        onChange={(v) => {
                            this.props.setFilterValue([v, filterValue[1]])
                        }}
                    >
                        {
                            filterOptions.map(item => (
                                <Option value={item.key} key={item.key}>{item.value}</Option>
                            ))
                        }
                    </Select>
                    <Input
                        placeholder='请输入值'
                        style={{ width: "100%", display: 'block' }}
                        value={filterValue[1]}
                        onChange={e => { this.props.setFilterValue([filterValue[0], e.target.value]) }}
                    />
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

ConditionFilter.defaultProps = {
    filterOptions: [
        { key: '1', value: '=' },
        { key: '2', value: '>' },
        { key: '3', value: '>=' },
        { key: '4', value: '<' },
        { key: '5', value: '<=' }
    ]
}

ConditionFilter.propTypes = {
    ...filterPropType
};