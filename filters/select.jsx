import React from 'react';
import { Checkbox } from 'antd';
import { filterPropType } from './propTypes';
import { immutableCompare, prefixClass } from './../utils';

export default class SelectionFilter extends React.Component {
    keys = [];

    componentDidMount() {
        this.extractKey();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!immutableCompare(prevProps.filterOptions, this.props.filterOptions)) {
            this.extractKey();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { filterOptions, filterValue } = this.props;
        if (!immutableCompare(filterOptions, nextProps.filterOptions) || !immutableCompare(filterValue, nextProps.filterValue)) {
            return true;
        }
        return false;
    }

    extractKey = () => {
        this.keys = [];
        this.props.filterOptions.forEach(item => {
            this.keys.push(item.key)
        });
    }

    onAllSelectChange = (e) => {
        const selected = e.target.checked ? this.keys : []
        this.props.setFilterValue(selected)
    }

    onChange = (e) => {
        const selected = [...this.props.filterValue];
        if (e.target.checked) {
            selected.push(e.target.value)
        } else {
            const index = selected.indexOf(e.target.value);
            selected.splice(index, 1)
        }
        this.props.setFilterValue(selected)
    }

    render() {
        const { filterOptions = [], filterValue = [] } = this.props;

        return (
            <div>
                <div className={prefixClass('header-cell--dropdown-content')}>
                    <div className={prefixClass('header-cell--dropdown-select-item')}>
                        <Checkbox
                            onChange={this.onAllSelectChange}
                            checked={filterValue.length && this.keys.length === filterValue.length}
                            indeterminate={filterValue.length && this.keys.length > filterValue.length}
                        >
                            全选
                        </Checkbox>
                    </div>
                    {
                        filterOptions.map(item => (
                            <div key={item.key} className={prefixClass('header-cell--dropdown-select-item')}>
                                <Checkbox onChange={this.onChange} checked={filterValue.includes(item.key)} value={item.key}>
                                    {item.value}
                                </Checkbox>
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

SelectionFilter.propTypes = {
    ...filterPropType
};