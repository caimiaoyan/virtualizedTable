import PropTypes from 'prop-types';

export const filterPropType = {
  filterValue: PropTypes.array,
  filterOptions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  setFilterValue: PropTypes.func,
  confirm: PropTypes.func,
  clearFilter: PropTypes.func,
};