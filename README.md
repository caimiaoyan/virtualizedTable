# 虚拟滚动表格使用说明

<br/>

## 文档api说明
* [VirtualizedTable](#table-api)
* [columns](#columns-api)
* [rowSelection](#rowselection-api)

<br/>

## 使用示例
 * [基础使用](#基础使用)
 * [展开行](#展开行)
 * [固定列、拖动手柄调整列宽、排序、自定义单元格内容](#固定列拖动手柄调整列宽排序自定义单元格内容)
 * [列选择](#列选择)
 * [表头分组](#表头分组)
 * [显示/隐藏列](#显示隐藏列)
 * [表头分组配合显示/隐藏列选择使用](#表头分组配合显示隐藏列选择使用)
 * [行/列合并](#行列合并)
 * [行事件处理器](#行事件处理器)
 * [可编辑单元格](#可编辑单元格)
 * [筛选](#筛选)
 * [自定义筛选项](#自定义筛选项)
 * [动态行高](#动态行高)

<br/>

### 基础使用
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: '序号', key: 'orderNumber', dataKey: 'orderNumber', width: 50, cellRenderer: ({ cellData: text, rowData: record, rowIndex: index }) => {
            return index + 1;
        }
    }, {
        title: 'column1', key: 'column1', dataKey: 'column1', width: 150
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 150
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 150
    }
]

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}--row--${i}`;
    }
    dataList.push(obj);
}
export default class Cp extends Component {
    render() {
        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 90px)"
                    loading={false}
                />
            </div>
        )
    }
}

```

### 展开行
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: 'column1', key: 'column1', dataKey: 'column1', width: 200
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 200
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 200
    }
]

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}--row--${i}`;
    }
    dataList.push(obj);
}

for (let i = 0; i < 10; i++) {
    let children = [];
    for (let j = 1; j <= 5; j++) {
        let obj = {};
        obj.id = `child-${i}-${j}`;
        for (let k = 1; k < 20; k++) {
            obj['column' + k] = `column${k}--child data--${j}`;
        }
        children.push(obj)
    }
    dataList[i].children = children
}

export default class Cp extends Component {
    render() {
        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 90px)"
                    expandRow={true}
                    //自定义行类名
                    rowClassName={
                        ({ rowData: record }) => {
                            if (record.children) return 'table-row-level-0';
                            return 'table-row-level-1';
                        }
                    }
                />
            </div>
        )
    }
}
```

### 固定列、拖动手柄调整列宽、排序、自定义单元格内容

```
import React, { Component } from 'react'; 100
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: 'column1', frozen: 'left', key: 'column1', dataKey: 'column1', width: 150, resizable: true, sortable: true, sortDirections: ['desc'], cellRenderer: ({ cellData: text, rowData: record}) => {
          return <div className='BaseTable__row-cell-text'>{`${text} - 自定义长内容，超长省略`}</div>
        }
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 150, resizable: true, sortable: true, sortDirections: ['asc']
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 150, resizable: true, sortable: true,
    }, {
        title: 'column4', key: 'column4', dataKey: 'column4', width: 150, resizable: true, sortable: true,
    }, {
        title: 'column5', key: 'column5', dataKey: 'column5', width: 150, resizable: true
    }, {
        title: 'column6', key: 'column6', dataKey: 'column6', width: 150, resizable: true
    }, {
        title: 'column7', key: 'column7', dataKey: 'column7', width: 150
    }
]

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row-${i}`;
    }
    dataList.push(obj);
}
export default class Cp extends Component {

    state = {
        sortState: {
            column3: 'asc'
        }
    }

    // 此处发起网络请求
    onColumnSort = ({ key, order }) => {
        this.setState({
            sortState: { [key]: order },
        })
    }

    render() {
        return (
            <div style={{padding: '15px'}}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 90px)"
                    onColumnSort={this.onColumnSort}
                    sortState={this.state.sortState}
                />
            </div>
        )
    }
}
```

### 列选择

```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: 'column1', key: 'column1', dataKey: 'column1', width: 200
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 200
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 200
    }
]

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row-${i}`;
    }
    dataList.push(obj);
}
export default class Cp extends Component {
    state = {
        selectedRowKeys: []
    }

    onSelectChange = (selectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    render() {

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
        };

        return (
            <div style={{padding: '15px'}}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 90px)"
                    rowSelection={rowSelection}
                />
            </div>
        )
    }
}
```

### 表头分组
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

let columns = [];
for (let i = 1; i <= 15; i++) {
    let key = 'column' + i;
    let obj = {
        title: key,
        key: key,
        dataKey: key,
        resizable: true,
        width: 120,
    };

    if (i <= 2) {
        obj.frozen = 'left'
    }

    if (i == 15) {
        obj.frozen = 'right'
    }

    columns.push(obj)
}

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row-${i}`;
    }
    dataList.push(obj);
}

const GroupRow = function (props) {
    const width = props.width || '100%';
    height = props.height || '100%';
    return (
        <div
            className={props.className}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }} >
            {props.children}
        </div>
    )
}

// 自定义表头渲染
const headerRenderer = ({ cells, columns, headerIndex }) => {
    const renderCells = [], groupCells = [];
    let width = 0, sumWidth = 0;

    columns.forEach((column, columnIndex) => {
        // 如果有冻结的column，则会有一些冻结单元格的占位符
        const placeholderKey = '__placeholder__';
        if (column[placeholderKey]) {
            renderCells.push(cells[columnIndex])
        } else {
            width = cells[columnIndex].props.style.width;
            if (['column3', 'column4', 'column5', 'column6'].includes(column.key)) {
                sumWidth += width;
                groupCells.push(cells[columnIndex])
                if (column.key === 'column6') {
                    //插入合并行后的jsx对象
                    renderCells.push(
                        <div style={{ height: '100%' }} key={`header-group-cell-${column.key}`}>
                            <GroupRow width={sumWidth} height={'50%'} className='BaseTable__header-row BaseTable__header-cell'>group column</GroupRow>
                            <GroupRow width={sumWidth} height={'50%'}>{groupCells}</GroupRow>
                        </div>
                    )
                    sumWidth = 0
                }
            } else {
                renderCells.push(cells[columnIndex])
            }
        }
    })
    return renderCells
}

export default class Index extends Component {
    render() {
        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 100px)"
                    loading={false}
                    headerRenderer={headerRenderer}
                    headerHeight={[60]}
                />
            </div>
        )
    }
}
```

### 显示/隐藏列
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: 'column1', key: 'column1', dataKey: 'column1', width: 150, resizable: true, hiddenControllable: true,   
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 150, resizable: true, hiddenControllable: true, hidden: true 
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 150, resizable: true, hiddenControllable: true,
    }, {
        title: 'column4', key: 'column4', dataKey: 'column4', width: 150, resizable: true, hiddenControllable: true, hidden: true
    }, {
        title: 'column5', key: 'column5', dataKey: 'column5', width: 150, resizable: true, hiddenControllable: true,
    }, {
        title: 'column6', key: 'column6', dataKey: 'column6', width: 150, resizable: true, hiddenControllable: true, hidden: true
    }, {
        title: 'column7', key: 'column7', dataKey: 'column7', width: 150, hiddenControllable: true,
    }, {
        title: 'column8', key: 'column8', dataKey: 'column8', width: 150, hiddenControllable: true, hidden: true
    }, {
        title: 'column9', key: 'column9', dataKey: 'column9', width: 150, hiddenControllable: true,
    }
]

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row-${i}`;
    }
    dataList.push(obj);
}
export default class Cp extends Component {

    render() {
        return (
            <div style={{padding: '15px'}}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 100px)"
                    loading={false}
                />
            </div>
        )
    }
}
```

### 表头分组配合显示/隐藏列选择使用
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

let columns = [];
for (let i = 1; i <= 15; i++) {
    let key = 'column' + i;
    let obj = {
        title: key,
        key: key,
        dataKey: key,
        resizable: true,
        width: 120,
        hiddenControllable: true,
    };

    if (i >= 3 && i <= 6) {
        obj.width = 100;
        // 自定义列显示隐藏的名称
        obj.groupTitle = `group column -> ${obj.title}`
    }

    if (i <= 2) {
        obj.frozen = 'left'
    }

    if (i == 15) {
        obj.frozen = 'right'
    }

    if (i >= 10 && i <= 11) {
        obj.hidden = true
    }

    columns.push(obj)
}

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row-${i}`;
    }
    dataList.push(obj);
}

const GroupRow = function (props) {
    const width = props.width || '100%';
    height = props.height || '100%';
    return (
        <div
            className={props.className}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }} >
            {props.children}
        </div>
    )
}

// 自定义表头渲染
const headerRenderer = ({ cells, columns, headerIndex }) => {
    const renderCells = [], groupCells = [];
    let width = 0, sumWidth = 0;

    const groupColumnKeys = ['column3', 'column4', 'column5', 'column6'];
    const visibleGroupColumnKeys = [];
    columns.forEach(column => {
        if (groupColumnKeys.includes(column.key)) {
            visibleGroupColumnKeys.push(column.key);
        }
    });

    columns.forEach((column, columnIndex) => {
        // 如果有冻结的column，则会有一些冻结单元格的占位符
        const placeholderKey = '__placeholder__';
        if (column[placeholderKey]) {
            renderCells.push(cells[columnIndex])
        } else {
            width = cells[columnIndex].props.style.width;
            if (visibleGroupColumnKeys.includes(column.key)) {
                sumWidth += width;
                groupCells.push(cells[columnIndex])
                if (column.key === visibleGroupColumnKeys[visibleGroupColumnKeys.length - 1]) {
                    //插入合并行后的jsx对象
                    renderCells.push(
                        <div style={{ height: '100%' }} key={`header-group-cell-${column.key}`}>
                            <GroupRow width={sumWidth} height={'50%'} className='BaseTable__header-row BaseTable__header-cell'>group column</GroupRow>
                            <GroupRow width={sumWidth} height={'50%'}>{groupCells}</GroupRow>
                        </div>
                    )
                    sumWidth = 0
                }
            } else {
                renderCells.push(cells[columnIndex])
            }
        }
    })
    return renderCells
}

export default class Index extends Component {
    render() {
        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 100px)"
                    loading={false}
                    headerRenderer={headerRenderer}
                    headerHeight={[60]}
                />
            </div>
        )
    }
}
```

### 行/列合并
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

let columns = [];
for (let i = 1; i <= 15; i++) {
    let key = 'column' + i;
    let obj = {
        title: key,
        key: key,
        dataKey: key,
        resizable: true,
        width: 100,
    };

    columns.push(obj)
}

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row${i}`;
    }
    dataList.push(obj);
}

const colSpanIndex = 1
columns[colSpanIndex].colSpan = ({ rowData, rowIndex }) => (rowIndex % 4) + 1
columns[colSpanIndex].align = 'center'

const rowSpanIndex = 0
columns[rowSpanIndex].rowSpan = ({ rowData, rowIndex }) =>
    rowIndex % 2 === 0 && rowIndex <= dataList.length - 2 ? 2 : 1
export default class Index extends Component {

    tableRef = React.createRef();

    rowRenderer = ({ rowData, rowIndex, cells, columns }) => {
        if (!columns.length) {
            return;
        }
        const colSpan = columns[colSpanIndex].colSpan({ rowData, rowIndex })
        if (colSpan > 1) {
            let width = cells[colSpanIndex].props.style.width
            for (let i = 1; i < colSpan; i++) {
                width += cells[colSpanIndex + i].props.style.width
                cells[colSpanIndex + i] = null
            }
            const style = {
                ...cells[colSpanIndex].props.style,
                width,
                backgroundColor: 'initial',
            }
            cells[colSpanIndex] = React.cloneElement(cells[colSpanIndex], { style })
        }

        const rowSpan = columns[rowSpanIndex].rowSpan({ rowData, rowIndex })
        if (rowSpan > 1) {
            const cell = cells[rowSpanIndex]
            const rowHeight = this.tableRef && this.tableRef.current && this.tableRef.current.props.rowHeight || 33;
            const style = {
                ...cell.props.style,
                backgroundColor: '#fff',
                height: rowSpan * rowHeight - 1,
                alignSelf: 'flex-start',
                zIndex: 1,
            }
            cells[rowSpanIndex] = React.cloneElement(cell, { style })
        }
        return cells
    }
    render() {

        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    ref={this.tableRef}
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 100px)"
                    rowRenderer={this.rowRenderer}
                    //需要设置为最大的行合并数值
                    overscanRowCount={2}
                />
            </div>
        )
    }
}
```

### 行事件处理器
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: 'column1', key: 'column1', dataKey: 'column1', width: 150
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 150
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 150
    }
]

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row${i}`;
    }
    dataList.push(obj);
}
export default class Cp extends Component {
    render() {

        const rowEventHandlers = {
            onClick: ({ rowData, rowIndex, rowKey, event }) => {
                console.log('click')
            },
            onDoubleClick: ({ rowData, rowIndex, rowKey, event }) => {
                console.log('double click')
            },
            onContextMenu: ({ rowData, rowIndex, rowKey, event }) => {
                event.preventDefault();
                console.log('context menu')
            },
            onMouseEnter: ({ rowData, rowIndex, rowKey, event }) => {
                console.log('mouse enter')
            },
            onMouseLeave: ({ rowData, rowIndex, rowKey, event }) => {
                console.log('mouse leave')
            }
        }

        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 90px)"
                    rowEventHandlers={rowEventHandlers}
                />
            </div>
        )
    }
}
```

### 可编辑单元格
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';
import { Input } from 'antd';

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row${i}`;
    }
    dataList.push(obj);
}
export default class Cp extends Component {

    state = {
        dataList
    }

    onChange = (e, record, column) => {
        const newData = [...this.state.dataList];
        const index = newData.findIndex(item => record.id === item.id);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            [column.dataKey]: e.currentTarget.value,
        });
        this.setState({ dataList: newData });
    }

    save = (e) => {
        console.log(e.currentTarget.value)
    }

    render() {

        const columns = [
            {
                title: 'column1', key: 'column1', dataKey: 'column1', width: 200, cellRenderer: ({ cellData: text, rowData: record, column }) => {
                    return <Input size="small" value={text} onChange={(e) => this.onChange(e, record, column)} onPressEnter={this.save} onBlur={this.save} />;
                }
            }, {
                title: 'column2', key: 'column2', dataKey: 'column2', width: 200
            }, {
                title: 'column3', key: 'column3', dataKey: 'column3', width: 200
            }
        ]

        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={this.state.dataList}
                    maxHeight="calc(100vh - 90px)"
                    loading={false}
                />
            </div>
        )
    }
}
```

### 筛选
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';
import { Button } from 'antd';

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column-${j}-row-${i}`;
    }
    dataList.push(obj);
}

export default class Cp extends Component {

    tableRef = React.createRef();

    onClear = () => {
        this.tableRef.current.clearFilters();
    }

    // 获取筛选项内容
    onColumnFilter = (filters) => {
        //在此处发起网络请求
        console.log(filters)
    }

    render() {

        const columns = [
            {
                title: 'column1', key: 'column1', dataKey: 'column1', width: 150
            }, {
                title: '多选框搜索', key: 'column2', dataKey: 'column2', width: 150, filterType: 'checkbox', filterOptions: [{ key: 0, value: '推荐' }, { key: 1, value: '拒绝' }, { key: 2, value: '未关联' }]
            }, {
                title: '单选框搜索', key: 'column3', dataKey: 'column3', width: 150, filterType: 'radio', filterOptions: [{ key: 0, value: '需要' }, { key: 1, value: '不需要' }]
            }, {
                title: '时间控件搜索', key: 'column4', dataKey: 'column4', width: 150, filterType: 'datePicker'
            }, {
                title: '数字搜索', key: 'column5', dataKey: 'column5', width: 150, filterType: 'condition'
            }, {
                title: '自定义条件搜索', key: 'column6', dataKey: 'column6', width: 150, filterType: 'condition', filterOptions: [{ key: '1', value: '厂牌' }, { key: '2', value: 'ON' }, { key: '3', value: '产品线' }]
            }, {
                title: 'column7', key: 'column7', dataKey: 'column7', width: 150
            }, {
                title: 'column8', key: 'column8', dataKey: 'column8', width: 150
            }
        ]

        return (
            <div style={{ padding: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <Button onClick={this.onClear}>清空全部筛选项</Button>
                </div>
                <VirtualizedTable
                    ref={this.tableRef}
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 130px)"
                    onColumnFilter={this.onColumnFilter}
                />
            </div>
        )
    }
}
```

### 自定义筛选项
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';
import { Button, Input, Icon } from 'antd';

let dataList = [];
for (let i = 1; i <= 10000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column-${j}-row-${i}`;
    }
    dataList.push(obj);
}

export default class Cp extends Component {

    tableRef = React.createRef();

    onClear = () => {
        this.tableRef.current.clearFilters();
    }

    // 获取筛选项内容
    onColumnFilter = (filters) => {
        //在此处发起网络请求
        console.log(filters)
    }

    render() {

        const columns = [
            {
                title: 'column1', key: 'column1', dataKey: 'column1', width: 150
            }, {
                title: '自定义筛选项', key: 'column2', dataKey: 'column2', width: 150, filterDropdown: ({ confirm, clearFilter, filterValue = [], setFilterValue }) => {
                    return (
                        <div style={{ padding: '10px' }}>
                            <p>自定义搜索项：</p>
                            <Input
                                ref={node => {
                                    this.searchInput = node;
                                }}
                                placeholder='请输入搜索值1'
                                style={{ width: 188, marginBottom: 8, display: 'block' }}
                                value={filterValue[0]}
                                onChange={e => {
                                    const v = e.target.value ? e.target.value : undefined;
                                    setFilterValue([v, filterValue[1]])
                                }}
                            />
                            <Input
                                ref={node => {
                                    this.searchInput = node;
                                }}
                                placeholder='请输入搜索值2'
                                style={{ width: 188, marginBottom: 10, display: 'block' }}
                                value={filterValue[1]}
                                onChange={e => {
                                    const v = e.target.value ? e.target.value : undefined;
                                    setFilterValue([filterValue[0], v])
                                }}
                            />
                            <Button
                                type="primary"
                                icon="search"
                                size="small"
                                style={{ width: 90, marginRight: 8 }}
                                onClick={() => {confirm()}}
                            >
                                确定
                            </Button>
                            <Button size="small" style={{ width: 90 }} onClick={() => {clearFilter()}}>
                                重置
                            </Button>
                        </div>
                    )
                }
            }, {
                title: '自定义筛选图标', key: 'column3', dataKey: 'column3', width: 150, filterType: 'datePicker', filterIcon: filtered => {
                    return <Icon type="search" className={filtered ? 'BaseTable--highlighter' : ''} />
                }
            }, {
                title: 'column4', key: 'column4', dataKey: 'column4', width: 150
            }, {
                title: 'column5', key: 'column5', dataKey: 'column5', width: 150
            }, {
                title: 'column6', key: 'column6', dataKey: 'column6', width: 150
            }, {
                title: 'column7', key: 'column7', dataKey: 'column7', width: 150
            }, {
                title: 'column8', key: 'column8', dataKey: 'column8', width: 150
            }
        ]

        return (
            <div style={{ padding: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <Button onClick={this.onClear}>清空全部筛选项</Button>
                </div>
                <VirtualizedTable
                    ref={this.tableRef}
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 130px)"
                    onColumnFilter={this.onColumnFilter}
                />
            </div>
        )
    }
}
```

### 动态行高
```
import React, { Component } from 'react';
import VirtualizedTable from 'customCpPath/virtualizedTable/';

const columns = [
    {
        title: 'column1', key: 'column1', dataKey: 'column1', width: 120, resizable: true
    }, {
        title: 'column2', key: 'column2', dataKey: 'column2', width: 150, resizable: true
    }, {
        title: 'column3', key: 'column3', dataKey: 'column3', width: 150, resizable: true
    }, {
        title: 'column4', key: 'column4', dataKey: 'column4', width: 150, resizable: true
    }, {
        title: 'column5', key: 'column5', dataKey: 'column5', width: 120, resizable: true
    }, {
        title: 'column6', key: 'column6', dataKey: 'column7', width: 120, resizable: true
    }, {
        title: 'column8', key: 'column8', dataKey: 'column8', width: 120, resizable: true
    }, {
        title: 'column9', key: 'column9', dataKey: 'column9', width: 120, resizable: true
    }
]

const desc = [
    'Veniam cumque minima cum.',
    'Gulangyu is a small island of Xiamen. It’s like a garden on the water. Cars and buses are not allowed to drive there, which makes the island so quiet that music played on the piano and violin can be heard',
    'Praesentium accusamus animi et beatae fugit fugit itaque.',
    'Dolores aut temporibus velit accusantium qui quam ipsa incidunt.'
];

let dataList = [];
for (let i = 1; i <= 3000; i++) {
    let obj = {};
    obj.id = i;
    for (let j = 1; j < 20; j++) {
        obj['column' + j] = `column${j}-row-${i}`;
        obj.column2 = desc[(i + j) % 4];
        obj.column3 = desc[(i + j + 1) % 4]
        obj.column4 = desc[(i + j + 2) % 4]
    }
    dataList.push(obj);
}
export default class Cp extends Component {

    render() {
        return (
            <div style={{ padding: '15px' }}>
                <VirtualizedTable
                    columns={columns}
                    data={dataList}
                    maxHeight="calc(100vh - 90px)"
                    estimatedRowHeight={64}
                />
            </div>
        )
    }
}
```


### table api

|  参数   | 说明  | 类型  | 默认值  |
|  ----   | ----  | ----  | ----  |
| fixed | 单元格宽度固定 | boolean | true |
| columns | 表格列的配置描述，具体项见下表 | object[] | - |
| data | 数据数组 | object[] | - |
| maxHeight | 表格高度 | string &#124; number | - |
| loading | 页面是否加载中 | boolean | false |
| rowKey | 唯一键 | string | 'id' |
| className | 表格类名 | string | - |
| expandRow | 是否展开行 | boolean | false |
| hasHeaderExpandIcon | 表格头部是否有展开全部的icon | boolean | true |
| expandAllRow | 是否展开所有行 | boolean | true |
| expandColumnKey | 展开icon所在列的key | string | 首列所在key |
| rowClassName | 表格行的类名 | function({ columns, rowData, rowIndex}): string &#124; string | - |
| onColumnSort | 排序回调函数 | function({ column, key, order }): * | - |
| sortState | 排序状态 | object | - |
| rowSelection | 表格行是否可选择，具体项见下表 | object | - |
| rowEventHandlers | 行事件处理器 | 行事件处理程序的对象 每个键都是行事件名称，如 onClick、onDoubleClick 等。每个处理程序的方法为 ({ rowData, rowIndex, rowKey, event }) => * | - |
| estimatedRowHeight | 预估行高，实际行高根据内容动态测量 | ({ rowData, rowIndex }) => number &#124; number | - |


### columns api
|  参数   | 说明  | 类型  | 默认值  |
|  ----   | ----  | ----  | ----  |
| title | 标题 | string | - |
| key | 列标志 | string | - |
| datakey | 数据标志 | string | - |
| align | 列单元格对齐 | string | 'left' |
| width | 列宽度 | number | - |
| width | 活动列宽度（每个表格都必须至少有一个活动列） | number | - |
| minWidth | 列的最小宽度，在列可调整大小时使用 | number | - |
| maxWidth | 列的最大宽度，在列可调整大小时使用 | number | - |
| resizable | 列是否可调整大小 | boolean | false |
| sortable | 该列是否可排序 | boolean | false |
| sortDirections | 列排序方位 | string[] | ['asc', 'desc'] |
| cellRenderer | 自定义列单元格渲染 | ({ cellData, columns, column, columnIndex, rowData, rowIndex, container, isScrolling }) => node | - |
| headerRenderer | 自定义表头渲染 | ({ columns, column, columnIndex, headerIndex, container }) => node | - |
| hiddenControllable | 该列是否在抽屉中可控制显示/隐藏, 设置width的列不可隐藏 | boolean | false |
| hidden | 列显示/隐藏 | boolean | false |
| groupTitle | 自定义列显示/隐藏的名称，默认取title字段| string | - |
| filterType | 列筛选类型| 'datePicker' &#124; 'number' &#124; 'checkbox' &#124; 'radio'| - |
| filterDropdown | 自定义列筛选 | ({ confirm, clearFilter, filterValue = [], setFilterValue }) => node | - |
| filterIcon | 自定义列筛选图标 | (filtered) => node | - |

### rowSelection api
|  参数   | 说明  | 类型  | 默认值  |
|  ----   | ----  | ----  | ----  |
| frozen | 把选择框列固定在左边 | string | 'left' |
| width | 宽度 | number | 33 |
| headerClassName | 表头类名 | string | - |
| selectedRowKeys | 指定选中项的 key 数组，需要和 onChange 进行配合 | string[] &#124; number[] | [] |
| onChange | 选中项发生变化时的回调 | function(selectedRowKeys): * | - |
