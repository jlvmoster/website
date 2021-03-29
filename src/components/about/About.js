import React from 'react';
import Divider from './Divider';
import Hobbies from './Hobbies';
import MainCard from './MainCard';

const About = () => (
  <div className='mx-auto max-w-2xl'>
    <MainCard />
    <Divider title='Hobbies' />
    <Hobbies />
  </div>
);

export default About;
