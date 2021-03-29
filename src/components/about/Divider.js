import React from 'react';
import PropTypes from 'prop-types';

const Divider = ({ title }) => (
  <div className='relative my-6'>
    <div className='absolute inset-0 flex items-center'>
      <div className='w-full border-t-2 border-gray-300 sm:border-t' />
    </div>
    <div className='relative flex justify-center'>
      <span className='hidden p-2 text-transparent text-2xl font-normal bg-transparent sm:block'>{title}</span>
      <span className='p-2 text-2xl font-normal bg-gray-100 sm:absolute sm:left-32'>{title}</span>
    </div>
  </div>
);

Divider.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Divider;
