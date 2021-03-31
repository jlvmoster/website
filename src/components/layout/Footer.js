import React from 'react';
import GitHubIcon from '../icons/fontawesome/GitHub';

const Footer = () => (
  <div className='z-50 bg-gray-800'>
    <div className='mx-auto px-2 max-w-7xl sm:px-6 lg:px-8'>
      <div className='flex items-center h-16'>
        <h2 className='flex-grow text-white font-mono text-xs'>
          © {new Date().getFullYear()}, Built with{' '}
          <a
            className='hover:underline cursor-pointer'
            href='https://www.gatsbyjs.com'
            target='_blank'
            rel='noreferrer'>
            Gatsby
          </a>
        </h2>
        <a
          className='w-7 h-7 text-gray-400 hover:text-white'
          href='https://github.com/jlvmoster/website'
          target='_blank'
          rel='noreferrer'>
          <GitHubIcon />
        </a>
      </div>
    </div>
  </div>
);

export default Footer;
