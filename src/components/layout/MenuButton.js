import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import XIcon from '../icons/X';
import MenuIcon from '../icons/Menu';

const MenuButton = ({ open, onClick }) => (
  <button
    type='button'
    className={clsx(
      'inline-flex items-center justify-center p-2 rounded-md',
      'text-gray-400 hover:text-white hover:bg-gray-700',
      'focus:outline-none focus:ring-white focus:ring-2 focus:ring-inset'
    )}
    aria-controls='mobile-menu'
    aria-expanded={open}
    onClick={onClick}>
    <span className='sr-only'>Open menu</span>
    {open ? <XIcon className='w-8 h-8' /> : <MenuIcon className='w-8 h-8' />}
  </button>
);

MenuButton.propTypes = {
  open: PropTypes.bool,
  onClick: PropTypes.func,
};

MenuButton.defaultProps = {
  open: false,
  onClick: () => {
    console.log('MenuButton onClick property not set');
  },
};

export default MenuButton;
