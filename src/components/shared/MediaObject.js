import React from 'react';
import PropTypes from 'prop-types';

const MediaObject = ({ children, media }) => (
  <div className='sm:flex'>
    <div className='flex flex-shrink-0 items-center justify-center'>{media}</div>
    <div className='mt-4 space-y-1 sm:ml-6 sm:mt-0'>{children}</div>
  </div>
);

MediaObject.propTypes = {
  children: PropTypes.node.isRequired,
  media: PropTypes.node.isRequired,
};

export default MediaObject;
