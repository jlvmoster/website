import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import { navbarLink, navbarLinkSelected } from './layout.module.css';

const NavbarLink = ({ label, path, selected, external, onClick }) =>
  external ? (
    <a
      className={clsx('block px-3 py-2 font-mono text-lg font-medium rounded-md sm:inline-block sm:text-base', {
        [navbarLink]: !selected,
        [navbarLinkSelected]: selected,
      })}
      href={path}
      target='_blank'
      rel='noreferrer'>
      {label}
    </a>
  ) : (
    <Link
      className={clsx('block px-3 py-2 font-mono text-lg font-medium rounded-md sm:inline-block sm:text-base', {
        [navbarLink]: !selected,
        [navbarLinkSelected]: selected,
      })}
      to={path}
      onClick={onClick}>
      {label}
    </Link>
  );

NavbarLink.propTypes = {
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  external: PropTypes.bool,
  onClick: PropTypes.func,
};

NavbarLink.defaultProps = {
  selected: false,
  external: false,
  onClick: () => {
    console.log('NavbarLink onClick property not set');
  },
};

export default NavbarLink;
