import React from 'react';
import { Transition } from 'react-spring/renderprops';
import { useRecoilState } from 'recoil';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';

import menuState from '../../states/menuState';
import pageState from '../../states/pageState';
import MenuButton from './MenuButton';
import NavbarLink from './NavbarLink';
import { navbarHeight } from './layout.module.css';

const Navbar = ({ title, links }) => {
  const [menu, setMenu] = useRecoilState(menuState);
  const [page, setPage] = useRecoilState(pageState);

  const onMenuButtonClick = () => {
    setMenu(menu => (menu === 'closed' ? 'open' : 'closed'));
  };

  const onLinkClick = path => () => {
    setPage(path);
  };

  return (
    <>
      <div className='z-50 bg-gray-800'>
        <div className='mx-auto px-2 max-w-7xl sm:px-6 lg:px-8'>
          <div className={clsx('relative flex items-center justify-between', [navbarHeight])}>
            <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
              <MenuButton open={menu === 'open'} onClick={onMenuButtonClick} />
            </div>
            <div className='flex flex-1 items-center justify-center sm:justify-start'>
              <div className='flex flex-1 items-center justify-center sm:justify-start'>
                <StaticImage
                  className='block sm:hidden'
                  src='../../images/gatsby-icon.png'
                  alt='Gatsby Logo'
                  placeholder='blurred'
                  quality={100}
                  formats={['AUTO', 'PNG']}
                  layout='fixed'
                  width={64}
                />
                <StaticImage
                  className='hidden sm:block'
                  src='../../images/gatsby-icon.png'
                  alt='Gatsby Logo'
                  placeholder='blurred'
                  quality={100}
                  formats={['AUTO', 'PNG']}
                  layout='fixed'
                  width={32}
                />
                <h1 className='hidden ml-2.5 text-white font-mono text-2xl md:block'>{title}</h1>
              </div>
              <nav className='z-40 hidden sm:block'>
                <div className='flex space-x-2.5'>
                  {links.map(link => (
                    <NavbarLink
                      key={link.path}
                      label={link.label}
                      path={link.path}
                      selected={page === link.path}
                      onClick={onLinkClick(link.path)}
                    />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <Transition
        items={menu === 'open'}
        from={{
          opacity: 0,
          transform: 'translateY(-40%)',
        }}
        enter={{
          opacity: 1,
          transform: 'translateY(0)',
        }}
        leave={{
          opacity: 0,
          transform: 'translateY(-40%)',
        }}
        config={{ duration: 200 }}>
        {show =>
          show &&
          (props => (
            <nav style={props} className='bg-gray-800 sm:hidden'>
              <div className='px-2.5 py-3 space-y-2.5'>
                {links.map(link => (
                  <NavbarLink
                    key={link.path}
                    label={link.label}
                    path={link.path}
                    selected={page === link.path}
                    onClick={onLinkClick(link.path)}
                  />
                ))}
              </div>
            </nav>
          ))
        }
      </Transition>
    </>
  );
};

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, path: PropTypes.string.isRequired }).isRequired
  ).isRequired,
};

export default Navbar;
