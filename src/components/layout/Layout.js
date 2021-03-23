import React from 'react';
import PropTypes from 'prop-types';

import Navbar from './Navbar';

const Layout = ({ children, metadata }) => (
  <div className='flex flex-col h-screen bg-gray-100 overflow-hidden'>
    <Navbar title={metadata.title} links={metadata.links} />
    <main className='container mx-auto px-2 max-w-7xl sm:px-6 lg:px-8'>{children}</main>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  metadata: PropTypes.shape({
    title: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.string.isRequired, path: PropTypes.string.isRequired }).isRequired
    ).isRequired,
  }).isRequired,
};

export default Layout;
