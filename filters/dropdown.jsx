import React from 'react';
import { render } from 'react-dom';
import { immutableCompare, renderElement, prefixClass } from './../utils'

class Dropdown extends React.Component {

    prevRect = {}

    state = {
        rect: {},
        visible: this.props.visible
    }

    ref = React.createRef();

    componentDidMount() {
        this.setState({ rect: this.ref.current.getBoundingClientRect() })
    }

    componentDidUpdate(prevProps, prevState){

        const rect = this.ref.current.getBoundingClientRect();
        if(rect.width && rect.width !== this.prevRect.width){
            this.prevRect = rect
            this.setState({rect})
        }

    }

    onClick = (e) => {
        e.nativeEvent.stopImmediatePropagation();
    }

    render() {
        const { rect } = this.state;
        const { target, visible } = this.props;
        const dispalyStyle = (visible ? 'block' : 'none');
        const targetRect = target.getBoundingClientRect();

        const left = targetRect.left + targetRect.width - (rect.width || 0);
        const top = targetRect.top + targetRect.height + 4;

        return (
            <div
                ref={this.ref}
                className={prefixClass('header-cell--dropdown')}
                style={{ left, top, display: dispalyStyle }}
                onClick={this.onClick}
            >
                {this.props.content}
            </div>
        )
    }
}

export default class FilterDropdown extends React.Component {

    div = undefined;
   
    componentDidMount() {

        const id = this.props.columnKey;
        if(document.getElementById(id)){
            this.div = document.getElementById(id)
        }else{
            this.div = document.createElement('div');
            this.div.id = id;
        }
        document.body.appendChild(this.div)

        render(
            <Dropdown
                target={this.ref}
                content={renderElement(() => this.props.filterDropdown(this.props))}
                visible= {Boolean(this.props.dropdownVisibles[this.props.columnKey])}
            />, this.div)

        document.addEventListener('click', this.hiddenFilterDropdown)
    }

    componentDidUpdate(prevProps, prevState) {
        render(
            <Dropdown
                target={this.ref}
                content={renderElement(() => this.props.filterDropdown(this.props))}
                visible= {Boolean(this.props.dropdownVisibles[this.props.columnKey])}
            />, this.div)
    }

    shouldComponentUpdate(nextProps, nextState) {
        const {allFilters, dropdownVisibles} = this.props;
        if (!immutableCompare(allFilters, nextProps.allFilters) || !immutableCompare(dropdownVisibles, nextProps.dropdownVisibles)) {
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.hiddenFilterDropdown);
    }

    hiddenFilterDropdown = () => {
        this.props.hiddenFilterDropdown()
    }

    onClick = (e) => {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation();
        this.props.dropdownVisibleChange(this.props.columnKey)
    }

    render() {
        return (
            <span
                ref={node => this.ref = node}
                className={prefixClass('header-cell--filter--icon')}
                onClick={this.onClick}
            >
                {this.props.children}
            </span>
        )
    }
}