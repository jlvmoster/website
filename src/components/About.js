import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

const About = () => (
  <div className='mx-auto max-w-2xl bg-white shadow overflow-hidden sm:rounded-lg'>
    <div className='px-4 py-5 sm:p-6'>
      <div className='sm:flex'>
        <div className='flex flex-shrink-0 items-center justify-center sm:mb-0'>
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
        <div className='mt-4 space-y-3 sm:ml-6 sm:mt-0'>
          <h4 className='text-2xl font-medium font-thin sm:text-3xl'>Hi, I'm Jalo!</h4>
          <p className='text-lg sm:text-justify sm:text-xl'>
            Proud Georgia Tech Alumni and Software Engineer at AT&T. Experienced in designing cloud-native solutions
            using modern full-stack technologies. Motivated problem-solver with an Agile mindset.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
