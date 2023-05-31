import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import BaseTable, { ExpandIcon } from 'react-base-table';
import { Spin, Icon } from 'antd';
import SelectionCell, { SelectionAllCell } from './selectionCell';
import ColumnsVisibleSeting from './columnsVisibleSeting';
import FilterDropdown from './filters/dropdown';
import DateFilter from './filters/date';
import SelectionFilter from './filters/select';
import RadioFilter from './filters/radio';
import ConditionFilter from './filters/condition';
import throttle from 'lodash/throttle';
import ResizeObserver from 'resize-observer-polyfill';
import { renderElement, immutableCompare, calcContainerHeight, getScrollbarSize, isObjectEqual, deepCopy, prefixClass, getObjectValue, uniqueArrayObject } from './utils';
import './index.less';

const RESIZE_THROTTLE_WAIT = 50;

const DEFAULT_SELECTION = {
    width: 33,
    frozen: 'left',
    resizable: false,
    align: 'center',
    headerClassName: prefixClass('header-cell--align-center')
}

export default class Index extends Component {
    constructor(props) {
        super();
        this.allRowKeys = [];
        this.expandColumnKey = this.handleExpandColumnKey(props);
        this.origMaxHeight = props.maxHeight;
        this.scrollbarSize = 0;
        this.scrollArgs = {};
        this.resizeColumns = props.columns;
        this.state = {
            columns: props.columns,
            width: props.width,
            maxHeight: props.emptyHeight,
            data: props.data,
            expandedRowKeys: props.expandedRowKeys,
            headerExpandedStatus: props.expandAllRow,
            selectedRowKeys: [],
            selectedRows: [],
            allRowSelected: false,
            allSelectedIndeterminate: false,
            dropdownVisibles: {},
            filteredStates: [],
            allFilters: {},
        }
    }

    componentDidMount() {

        const { rowSelection, data, rowKey } = this.props;

        //把maxHeight的计算属性转换成实际数字
        this.setState({ maxHeight: calcContainerHeight(this.props.maxHeight) })

        //计算滚动条宽度
        this.scrollbarSize = getScrollbarSize();

        //处理表头
        this.handleColumns(this.props);

        //处理表格数据
        this.handleData(this.props);

        if (rowSelection && Array.isArray(rowSelection.selectedRowKeys)) {
            this.setState({
                selectedRowKeys: rowSelection.selectedRowKeys,
                selectedRows: data.filter(item => rowSelection.selectedRowKeys.includes(item[rowKey]))
            }, () => {
                this.handleAllRowSelected();
            })
        }

        this.resizeWidthObserver = new ResizeObserver(throttle((entries) => {
            const { width } = this.state;
            const { width: _width } = entries[0].contentRect || {};
            if (width === _width) {
                return;
            }
            this.setState({
                width: _width,
                columns: this.calcColumnsWidth()
            })
            console.info("Table width size changed");
        }, RESIZE_THROTTLE_WAIT))

        if (!this.props.width) {
            //监听容器宽度变化
            this.resizeWidthObserver.observe(this.tableWrapperRef);
        }

        // 监听浏览器窗口高度变化
        window.onresize = this.windowResize;
    }

    componentWillReceiveProps(nextProps) {
        const { maxHeight, columns, data, rowSelection, rowKey } = nextProps;
        const { selectedRowKeys } = rowSelection || {};

        //处理表格宽度
        if (!isObjectEqual(columns, this.props.columns)) {
            this.resizeColumns = columns;
            this.expandColumnKey = this.handleExpandColumnKey(nextProps);
            this.handleColumns(nextProps);
        }

        //处理表格数据
        if (!immutableCompare(data, this.props.data)) {
            this.handleData(nextProps);
        }

        if (maxHeight !== this.origMaxHeight) {
            this.origMaxHeight = maxHeight;
            this.setState({ maxHeight: calcContainerHeight(maxHeight) })
        }

        if (Array.isArray(selectedRowKeys) && !immutableCompare(selectedRowKeys, this.state.selectedRowKeys)) {
            this.setState({ selectedRowKeys }, () => {
                this.handleAllRowSelected();
            })
        }

        if (Array.isArray(selectedRowKeys) && 
            (!immutableCompare(selectedRowKeys, this.state.selectedRowKeys) || !immutableCompare(data, this.props.data))) {
            this.setState({ selectedRows: data.filter(item => selectedRowKeys.includes(item[rowKey])) });
        }
    }

    componentWillUnmount() {
        this.resizeWidthObserver.unobserve(this.tableWrapperRef);
        window.removeEventListener("resize", this.windowResize);
    }

    //监听浏览器窗口变化
    windowResize = throttle(() => {
        const { maxHeight } = this.props;
        this.setState({
            origMaxHeight: maxHeight,
            maxHeight: calcContainerHeight(maxHeight)
        })
    }, RESIZE_THROTTLE_WAIT)

    //创建表格容器引用
    createTableWrapperRef = (el) => {
        if (el) {
            this.tableWrapperRef = el;
            if (!this.props.width) {
                this.setState({ width: el.getBoundingClientRect().width })
            }
        }
    }

    handleColumns = () => {
        this.setState({ columns: this.calcColumnsWidth() })
    }

    handleData = ({ data }) => {
        const { expandedRowKeys, headerExpandedStatus } = this.state;
        this.allRowKeys = [];
        const _data = this.addParentId(data);
        let _expandedRowKeys = [...expandedRowKeys];
        //提取表格所有行的key
        this.getAllExpendKeys(_data);
        console.info(`一共有${this.allRowKeys.length}行`)
        if (headerExpandedStatus) {
            _expandedRowKeys = [...expandedRowKeys, ...this.allRowKeys];
        }

        this.setState({
            expandedRowKeys: Array.from(new Set(_expandedRowKeys))
        })
    }

    //计算行展开icon所在的列
    handleExpandColumnKey = ({ expandRow, expandColumnKey, columns }) => {
        if (!expandRow) return undefined;
        return expandColumnKey || (columns[0] && columns[0].key);
    }

    //给children子节点添加parendId
    addParentId = (data = [], parentId = undefined, rowKey = this.props.rowKey) => {
        if (!Array.isArray(data)) {
            return data;
        }

        if (data.length === 0 || !this.props.expandRow) {
            return data;
        }

        data.map(item => {
            parentId && (item.parentId = parentId);
            if (Array.isArray(item.children) && item.children.length) {
                return this.addParentId(item.children, item[rowKey])
            }
            return item;
        })
        return data;
    }

    //提取表格全部行的key
    getAllExpendKeys = (data = [], rowKey = this.props.rowKey) => {
        data.forEach(item => {
            this.allRowKeys.push(item[rowKey]);
            if (Array.isArray(item.children) && item.children.length) {
                this.getAllExpendKeys(item.children)
            }
        })
    }

    dropdownVisibleChange = (key) => {
        this.setState({ dropdownVisibles: { [key]: !this.state.dropdownVisibles[key] } })
    }

    hiddenFilterDropdown = () => {
        this.setState({ dropdownVisibles: {} })
    }

    setFilterValue = (key, value) => {
        this.setState({
            allFilters: { ...this.state.allFilters, [key]: value }
        })
    }

    //筛选
    confirmFilter = (key) => {
        const { onColumnFilter } = this.props;
        if (onColumnFilter && typeof onColumnFilter === 'function') {
            onColumnFilter(this.state.allFilters);
        }
        this.setState({
            filteredStates: Array.from(new Set([...this.state.filteredStates, key])),
            dropdownVisibles: { [key]: !this.state.dropdownVisibles[key] }
        })
    }

    //清除筛选项
    clearFilter = (key) => {
        const { onColumnFilter } = this.props;
        const filteredStates = [...this.state.filteredStates];
        const newFilters = { ...this.state.allFilters };

        delete (newFilters[key])

        if (typeof onColumnFilter === 'function') {
            onColumnFilter(newFilters);
        }

        filteredStates.splice(filteredStates.indexOf(key), 1)

        this.setState({
            filteredStates,
            dropdownVisibles: {},
            allFilters: newFilters
        })
    }

    //清除所有筛选项
    clearFilters = () => {
        const { onColumnFilter } = this.props;
        if (typeof onColumnFilter === 'function') {
            onColumnFilter({});
        }
        this.setState({
            filteredStates: [],
            dropdownVisibles: {},
            allFilters: {}
        })
    }

    //计算包含freeWidth的列宽度
    calcColumnsFreeWidth = (_columns = [], width = this.state.width) => {

        if (!Array.isArray(_columns) || (Array.isArray(_columns) && !_columns.length)) return { _columns, activeColumns };

        let columns = deepCopy(_columns);

        //活动列对象
        let activeColumns = columns.filter(item => item.freeWidth);
        //固定列总宽度
        let sumfixedColumnsWidth = 0;
        //活动列总宽度
        let sumActiveColumnsWidth = 0;

        width = width - this.scrollbarSize;
        const rowSelection = this.props.rowSelection;
        if (rowSelection) {
            const rowSelectionWidth = getObjectValue(rowSelection, DEFAULT_SELECTION, 'width');
            width = width - Number(rowSelectionWidth);
        }

        columns.forEach(item => {
            if (item.freeWidth) {
                sumActiveColumnsWidth += item.freeWidth
            } else if (item.width && item.hiddenControllable && item.hidden) {
                sumfixedColumnsWidth += 0
            } else if (item.width) {
                sumfixedColumnsWidth += item.width
            }
        })

        //表格没有多余宽度,把freeWidth当成列宽度
        if (width <= (sumfixedColumnsWidth + sumActiveColumnsWidth)) {
            columns.map((item) => {
                if (item.freeWidth) {
                    item.width = item.freeWidth;
                    delete item.resizable;
                }
                return item;
            })
        } else {
            // 多余的宽度平均分配到活动列上
            const excessWidth = width - sumfixedColumnsWidth - sumActiveColumnsWidth;
            const averageExcessWidth = Math.floor(excessWidth / activeColumns.length);
            let sumWidth = sumfixedColumnsWidth;
            columns.map((item) => {
                if (item.freeWidth) {
                    if (item.key != activeColumns[activeColumns.length - 1].key) {
                        item.width = item.freeWidth + averageExcessWidth;
                        sumWidth += item.width;
                    } else { // 最后一列补足剩余的宽度
                        item.width = width - sumWidth;
                    }
                    delete item.resizable;
                    delete item.hidden;
                    delete item.hiddenControllable;
                }
                return item;
            })
            activeColumns = columns.filter(item => item.freeWidth);
        }

        return { columns, activeColumns }

    }

    //返回处理过列宽的columns
    calcColumnsWidth = ({
        columns: _columns = this.resizeColumns,
        resizingKey
    } = {}) => {

        if (!Array.isArray(_columns) || !_columns.length) return { _columns };

        let width = this.tableWrapperRef && this.tableWrapperRef.getBoundingClientRect().width || this.props.width || 0;
        let columns = deepCopy(_columns);

        //列总宽度
        let sumfixedColumnsWidth = 0;
        //可见列对象
        let vsibileColumns = [];

        width = width - this.scrollbarSize;
        const rowSelection = this.props.rowSelection;
        if (rowSelection) {
            const rowSelectionWidth = getObjectValue(rowSelection, DEFAULT_SELECTION, 'width');
            width = width - Number(rowSelectionWidth);
        }

        columns.forEach(item => {
            if (item.width && !item.hidden) {
                sumfixedColumnsWidth += item.width;
                if (item.key !== resizingKey) {
                    vsibileColumns.push(item);
                }
            }
        })

        if (width > sumfixedColumnsWidth) {

            let sumWidth = 0;
            const excessWidth = Number((width - sumfixedColumnsWidth) / vsibileColumns.length);
            const random = resizingKey ? Math.floor(Math.random() * vsibileColumns.length) : vsibileColumns.length - 1

            columns.map((item) => {
                if (!item.hidden && item.width) {
                    if (item.key != vsibileColumns[random].key && item.key !== resizingKey) {
                        item.width = Math.floor(item.width + excessWidth);
                        sumWidth += item.width;
                    }
                    if (item.key === resizingKey) {
                        sumWidth += item.width;
                    }
                }
                return item;
            })
            vsibileColumns[random].width = width - sumWidth;
        }

        return columns

    }

    //展开/收起行
    onRowExpand = (args) => {
        const { expanded, rowKey } = args;
        const { onRowExpand: _onRowExpand } = this.props;

        if (_onRowExpand && typeof _onRowExpand === 'function') {
            _onRowExpand(args)
        }

        const tempExpandedRowKeys = [...this.state.expandedRowKeys];
        if (expanded) {
            tempExpandedRowKeys.push(rowKey);
        } else {
            tempExpandedRowKeys.splice(tempExpandedRowKeys.indexOf(rowKey), 1)
        }

        this.setState({ 'expandedRowKeys': Array.from(new Set(tempExpandedRowKeys)) })

    }

    //展开/收起全部行
    onAllRowExpand = () => {
        const { headerExpandedStatus } = this.state;
        this.setState({
            headerExpandedStatus: !headerExpandedStatus,
            expandedRowKeys: headerExpandedStatus ? [] : this.allRowKeys
        })
    }

    //调整列宽
    onColumnResize = ({ column, width }) => {
        const fixedSumWidth = this.state.columns.reduce((accumulator, item, _index) => {
            if (item.frozen && item.width && item.key !== column.key) {
                return accumulator + item.width;
            } else {
                return accumulator;
            }
        }, 0)
        const maxFixedWidth = this.state.width - fixedSumWidth - 20;
        const _columns = [...this.state.columns].map(item => {
            if (item.key === column.key) item = column;
            if (column.frozen && column.width >= maxFixedWidth) {
                column.width = maxFixedWidth
            }
            return item;
        })
        if (Object.keys(this.state.dropdownVisibles).length) this.hiddenFilterDropdown();
        this.resizeColumns = _columns;
        this.setState({
            columns: this.calcColumnsWidth({ columns: _columns, resizingKey: column.key })
        })
    }

    //选择行变化
    onHandleSelectChange = ({ selected, rowData }) => {
        const { rowKey } = this.props;
        const selectedRowKeys = [...this.state.selectedRowKeys];
        const selectedRows = [...this.state.selectedRows];
        const key = rowData[rowKey];
        const { onChange = function () { }, onSelect = function () { } } = this.props.rowSelection;

        if (selected) {
            if (!selectedRowKeys.includes(key)) {
                selectedRowKeys.push(key)
                selectedRows.push(rowData)
            }
        } else {
            const index = selectedRowKeys.indexOf(key)
            if (index > -1) selectedRowKeys.splice(index, 1)

            const rowIndex = selectedRows.findIndex(item => item[rowKey] === key);
            if (rowIndex > -1) selectedRows.splice(rowIndex, 1)
        }

        this.setState({ selectedRowKeys, selectedRows }, () => {
            onChange(selectedRowKeys, selectedRows);
            onSelect(rowData, selected, selectedRows);
            this.handleAllRowSelected();
        })

    }

    //选择全部行变化
    onHandleAllSelectChange = ({ selected }) => {
        const { rowKey, data, rowSelection } = this.props;
        const { onChange = function () { }, onSelectAll = function () { } } = rowSelection;
        const selectedRowKeys = [...this.state.selectedRowKeys];
        const selectedRows = [...this.state.selectedRows];
        let _selectedRowKeys = [];
        let _selectedRows = [];
        if (selected) {
            _selectedRowKeys = Array.from(new Set([...selectedRowKeys, ...this.allRowKeys]));
            _selectedRows = uniqueArrayObject([...selectedRows, ...data], rowKey);
        } else {
            _selectedRowKeys = selectedRowKeys.filter(item => !this.allRowKeys.includes(item))
           _selectedRows = selectedRows.filter(item => !this.allRowKeys.includes(item[rowKey]))
        }
        this.setState({
            selectedRowKeys: _selectedRowKeys,
            selectedRows: _selectedRows,
            allRowSelected: selected,
            allSelectedIndeterminate: false
        }, () => {
            onChange(_selectedRowKeys, _selectedRows);
            onSelectAll(selected, _selectedRows);
        })
    }

    //选择全部行
    handleAllRowSelected = () => {
        
        if(!this.allRowKeys.length){
            this.setState({ 
                allRowSelected: false,
                allSelectedIndeterminate: false
            })
            return;
        }
        
        const { selectedRowKeys } = this.state;
        let allRowSelected = true;
        let indeterminate = false;

        for (let i = 0; i < this.allRowKeys.length; i++) {

            if(indeterminate && !allRowSelected){
                break;
            }

            if(selectedRowKeys.includes(this.allRowKeys[i])){
                indeterminate = true;
            }else{
                allRowSelected = false;
            }
        }
     
        this.setState({ 
            allRowSelected,
            allSelectedIndeterminate: (!allRowSelected && indeterminate) ? true : false
        })
    }

    //列显示/隐藏变化
    onHandleColumnsVisible = (columns) => {
        this.setState({
            columns: this.calcColumnsWidth({ columns })
        })
    }

    //渲染筛选项
    renderFilterer = ({ column }) => {
        const filtered = Array.isArray(column.filteredStates) && column.filteredStates.includes(column.key);
        return (
            <FilterDropdown
                columnKey={column.key}
                {...column}
            >
                {column.filterIcon ? column.filterIcon(filtered) : <Icon type="funnel-plot" className={filtered ? 'BaseTable--highlighter' : ''} />}
            </FilterDropdown>
        )
    }

    render() {

        const {
            rowKey,
            fixed,
            data,
            height,
            emptyHeight,
            loading,
            headerHeight,
            rowHeight,
            columns: _columns,
            maxHeight,
            emptyRenderer,
            rowSelection,
            hasHeaderExpandIcon,
            onColumnFilter,
            onScroll,
            bordered,
            className,
            ...rest
        } = this.props;

        let {
            columns,
            width,
            maxHeight: _maxHeight,
            expandedRowKeys,
            selectedRowKeys,
            allRowSelected,
            headerExpandedStatus,
            dropdownVisibles,
            filteredStates,
            allFilters,
            allSelectedIndeterminate,
        } = this.state;

        //数据为空
        let _height = height;
        if (Array.isArray(data) && data.length === 0) {
            _height = emptyHeight;
            _maxHeight = undefined;
        }

        let finalColumns = [];
        columns.forEach(column => {
            let newColumn = { ...column };
            let expandedHeader = false;

            if (column.filterType || column.filterDropdown) {
                newColumn = {
                    ...newColumn,
                    filteredStates: filteredStates,
                    dropdownVisibles: dropdownVisibles,
                    confirm: () => this.confirmFilter(column.key),
                    clearFilter: () => this.clearFilter(column.key),
                    dropdownVisibleChange: this.dropdownVisibleChange,
                    hiddenFilterDropdown: this.hiddenFilterDropdown,
                    filterValue: allFilters[column.key] || [],
                    allFilters: allFilters,
                    setFilterValue: value => this.setFilterValue(column.key, value),
                    renderFilterer: this.renderFilterer
                }

                if (column.filterType === 'datePicker') {
                    newColumn.filterDropdown = (args) => <DateFilter {...args} />
                } else if (column.filterType === 'condition') {
                    newColumn.filterDropdown = (args) => <ConditionFilter {...args} />
                } else if (column.filterType === 'checkbox' && Array.isArray(column.filterOptions)) {
                    newColumn.filterDropdown = (args) => <SelectionFilter {...args} />
                } else if (column.filterType === 'radio' && Array.isArray(column.filterOptions)) {
                    newColumn.filterDropdown = (args) => <RadioFilter {...args} />
                }

                expandedHeader = true;
            }

            if (this.expandColumnKey && hasHeaderExpandIcon && column.key === this.expandColumnKey) {
                const origColumn = _columns.filter(item => item.key === column.key)[0] || {}
                newColumn.headerRenderer = () => (
                    <div className={prefixClass('header-cell--expandable')}>
                        <ExpandIcon
                            expanded={headerExpandedStatus}
                            expandable={true}
                            onExpand={(e) => this.onAllRowExpand(e)}
                        />
                        {renderElement(origColumn.headerRenderer || column.title)}
                    </div>
                )
                expandedHeader = true;
            }

            if (expandedHeader) {
                finalColumns.push(newColumn)
            } else {
                finalColumns.push(column)
            }

        })

        if (rowSelection) {
            let selectionColumn = {
                cellRenderer: SelectionCell,
                headerRenderer: SelectionAllCell,
                key: '__selection__',
                rowKey: rowKey,
                selectedRowKeys: selectedRowKeys,
                allRowSelected: allRowSelected,
                indeterminate: allSelectedIndeterminate,
                onChange: this.onHandleSelectChange,
                onAllChange: this.onHandleAllSelectChange
            };
            ['width', 'resizable', 'frozen', 'align', 'headerClassName'].forEach(key => {
                selectionColumn[key] = getObjectValue(rowSelection, DEFAULT_SELECTION, key)
            })
            finalColumns = [selectionColumn, ...finalColumns]
        }

        const _className = cn(className, {
            [prefixClass('noBorder')]: bordered === false
        })

        return (
            <div id="base_table_wrapper" ref={this.createTableWrapperRef}>
                <Spin wrapperClassName={prefixClass('loading')} spinning={loading || false}>
                    <BaseTable
                        {...rest}
                        ref={(baseTableRef) => {
                            this.tableRef = baseTableRef
                        }}
                        rowKey={rowKey}
                        fixed={fixed}
                        columns={finalColumns}
                        data={data}
                        width={width}
                        height={_height}
                        maxHeight={_maxHeight}
                        className={_className}
                        headerHeight={headerHeight}
                        rowHeight={rowHeight}
                        expandColumnKey={this.expandColumnKey}
                        expandedRowKeys={expandedRowKeys}
                        onRowExpand={this.onRowExpand}
                        onColumnResize={this.onColumnResize}
                        ignoreFunctionInColumnCompare={false}
                        onEndReachedThreshold={RESIZE_THROTTLE_WAIT}
                        emptyRenderer={renderElement(emptyRenderer || <div className={prefixClass('empty')}>暂无数据</div>)}
                        onScroll={(args) => {
                            if (Object.keys(dropdownVisibles).length && this.scrollArgs.scrollLeft !== args.scrollLeft) {
                                this.setState({ dropdownVisibles: {} })
                            }
                            this.scrollArgs = args;
                            if (onScroll) onScroll(args)
                        }}
                    />
                </Spin>
                <ColumnsVisibleSeting
                    columns={columns}
                    onHandleColumns={this.onHandleColumnsVisible}
                />
            </div>
        )
    }
}

Index.defaultProps = {
    ...BaseTable.defaultProps,
    //列的宽度是固定的还是灵活的
    fixed: true,
    //表格高度，必须
    maxHeight: undefined,
    //表格宽度，不传入时默认占据容器div的宽度，当width由props传入时，业务组件自定义控制width，非必须
    width: 0,
    //表头盖度
    headerHeight: 35,
    //行高
    rowHeight: 33,
    //表格无数据时的高度
    emptyHeight: 71,
    //是否展开行
    expandRow: false,
    //表格头部是否有展开全部的icon
    hasHeaderExpandIcon: true,
    //是否展开所有行，默认都展开
    expandAllRow: true,
    //展开icon所在列的key
    expandColumnKey: undefined,
    //展开列, 用于初始化自定义展开列
    expandedRowKeys: [],
    //数据加载状态
    loading: false,
    //是否展示外边框和列边框
    bordered: true,
}

Index.propTypes = {
    ...BaseTable.propTypes,
    width: PropTypes.number,
    height: PropTypes.number,
    maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    headerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]).isRequired,
    rowHeight: PropTypes.number,
    emptyHeight: PropTypes.number,
    hasHeaderExpandIcon: PropTypes.bool,
    expandAllRow: PropTypes.bool,
    expandRow: PropTypes.bool,
    expandedRowKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    loading: PropTypes.bool,
}
