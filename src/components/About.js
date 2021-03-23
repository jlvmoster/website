import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

const About = () => (
  <div className='mx-auto max-w-2xl bg-white shadow overflow-hidden sm:rounded-lg'>
    <div className='px-4 py-5 sm:p-6'>
      <div className='space-y-4 sm:flex sm:space-x-6 sm:space-y-0'>
        <div className='flex flex-shrink-0 justify-center sm:mb-0'>
          <StaticImage
            className='inline-block rounded-full'
            src='../images/professional.jpg'
            alt='Professional'
            placeholder='blurred'
            quality={100}
            formats={['AUTO', 'JPEG']}
            layout='fixed'
            width={180}
          />
        </div>
        <div className='space-y-3'>
          <h4 className='text-4xl font-medium font-thin'>Hi, I'm Jalo!</h4>
          <p className='text-justify text-lg'>
            I'm a Software Engineer with several years of experience in cloud and full-stack design and implementation.
            I'm a motivated problem-solver with an aptitude for quickly mastering new skills, technologies, and roles.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
