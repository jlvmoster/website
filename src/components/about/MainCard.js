import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import Card from '../shared/Card';
import MediaObject from '../shared/MediaObject';

const MainCard = () => (
  <Card>
    <MediaObject
      media={
        <StaticImage
          className='inline-block rounded-full'
          src='../../images/professional.jpg'
          alt='Professional'
          placeholder='blurred'
          quality={100}
          formats={['AUTO', 'JPEG']}
          layout='fixed'
          width={180}
        />
      }>
      <h4 className='text-2xl font-medium font-thin sm:text-3xl'>Hi, I'm Jalo!</h4>
      <p className='text-base sm:text-justify sm:text-lg'>
        I'm a proud Georgia Tech Alumni and Software Engineer at AT&T. I have several years of experience in designing
        cloud-native solutions using modern full-stack implementations. As a motivated problem-solver with an Agile
        mindset, I'm ready to tackle challenges in any industry.
      </p>
    </MediaObject>
  </Card>
);

export default MainCard;
