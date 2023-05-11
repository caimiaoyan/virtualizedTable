import React from 'react';
import { Drawer, Checkbox, Icon } from 'antd';
import { immutableCompare, isObjectEqual, deepCopy, prefixClass } from './utils';

export default class SelectionCell extends React.Component {

    state = {
        visible: false
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!isObjectEqual(nextProps.columns, this.props.columns) || !immutableCompare(nextState, this.state)) {
            return true;
        }
        return false;
    }

    onOpen = () => {
        this.setState({ visible: !this.state.visible })
    }

    onClose = () => {
        this.setState({ visible: false })
    }

    onChange = (e) => {
        const columns = deepCopy(this.props.columns);
        columns.map(item => {
            if (item.hiddenControllable && item.key === e.target.value) {
                item.hidden = !e.target.checked
            }
            return item;
        })
        this.props.onHandleColumns(columns)
    }

    onAllSelectChange = (e) => {
        const columns = deepCopy(this.props.columns);
        columns.map(item => {
            if (!item.freeWidth && item.hiddenControllable) {
                item.hidden = !e.target.checked
            }
            return item;
        })
        this.props.onHandleColumns(columns)
    }

    render() {

        const { columns } = this.props;
        const { visible } = this.state;

        let hiddenControllableLen = 0;
        let visibleLen = 0;
        for (let i = 0; i < columns.length; i++) {
            if (!columns[i].freeWidth && columns[i].hiddenControllable) {
                hiddenControllableLen++;
                if (!columns[i].hidden) {
                    visibleLen++;
                }
            }
        }

        return (
            hiddenControllableLen ?
                <Drawer
                    title="请勾选需显示的列表项"
                    placement="right"
                    closable={true}
                    onClose={this.onClose}
                    visible={visible}
                    className={prefixClass('drawer')}
                    width={256}
                    handler={
                        <div className='BaseTable__drawer-setting-icon' onClick={this.onOpen}>
                            <Icon
                                type={visible ? 'close' : 'setting'}
                                style={{
                                    color: '#fff',
                                    fontSize: 20,
                                }}
                            />
                        </div>
                    }
                    style={{
                        zIndex: 999,
                    }}
                >
                    <div className={prefixClass('drawer-row')}>
                        <Checkbox
                            onChange={this.onAllSelectChange}
                            checked={hiddenControllableLen === visibleLen}
                            indeterminate={visibleLen && hiddenControllableLen > visibleLen}
                        >
                            全选
                        </Checkbox>
                    </div>
                    {
                        columns.map(item => item.hiddenControllable && !item.freeWidth &&
                            <div className={prefixClass('drawer-row')} key={item.key}>
                                <Checkbox onChange={this.onChange} checked={!item.hidden} value={item.key}>
                                    {item.groupTitle || item.title}
                                </Checkbox>
                            </div>
                        )
                    }
                </Drawer> : null
        )
    }
}