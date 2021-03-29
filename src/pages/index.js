import React from 'react';
import SEO from '../components/shared/SEO';
import About from '../components/about/About';

const IndexPage = () => (
  <>
    <SEO title='About' />
    <div className='mt-4'>
      <About />
    </div>
  </>
);

export default IndexPage;
