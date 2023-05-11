import React from 'react';
import { Checkbox } from 'antd';
import { immutableCompare } from './utils';

export default class SelectionCell extends React.Component {

    shouldComponentUpdate(nextProps) {
        if (!immutableCompare(nextProps.column.selectedRowKeys, this.props.column.selectedRowKeys)) {
            return true;
        }
        return false;
    }

    handleChange = e => {
        const { rowData, rowIndex, column } = this.props
        const { onChange } = column

        onChange({ selected: e.target.checked, rowData, rowIndex })
    }

    render() {
        const { rowData = {}, column } = this.props
        const { selectedRowKeys, rowKey } = column
        const checked = selectedRowKeys.includes(rowData[rowKey])

        return (
            <Checkbox checked={checked} onChange={this.handleChange} />
        )
    }
}

export class SelectionAllCell extends React.Component {

    shouldComponentUpdate(nextProps) {
        if (nextProps.column.selectedAllRow !== this.props.column.selectedAllRow) {
            return true;
        }
        return false;
    }

    handleChange = e => {
        const { column } = this.props
        const { onAllChange } = column

        onAllChange({ selected: e.target.checked })
    }

    render() {
        const { column } = this.props
        return (
            <Checkbox checked={column.selectedAllRow} onChange={this.handleChange} />
        )
    }
}