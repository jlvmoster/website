import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children }) => (
  <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
    <div className='px-4 py-5 sm:p-6'>{children}</div>
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Card;
