import React from 'react';
import Card from '../shared/Card';
import MediaObject from '../shared/MediaObject';
import BasketballBallIcon from '../icons/fontawesome/BasketballBall';
import BitcoinIcon from '../icons/fontawesome/Bitcoin';
import GamepadIcon from '../icons/fontawesome/Gamepad';

const Hobbies = () => (
  <div className='flex flex-col space-y-3'>
    <Card>
      <MediaObject media={<BasketballBallIcon className='w-16 h-16 text-yellow-600' />}>
        <h4 className='text-lg font-bold'>Basketball</h4>
        <p>
          I love playing basketball despite my 5'2" stature. I definitely know some ankle breaker moves and I'm pretty
          consistent with the three ball. Go Celtics!
        </p>
      </MediaObject>
    </Card>

    <Card>
      <MediaObject media={<GamepadIcon className='w-16 h-16 text-gray-700' />}>
        <h4 className='text-lg font-bold'>Gaming</h4>
        <p className='mt-1'>
          I like to play video games on my Xbox once in a while. My Call of Duty: Warzone skills are subpar, but my NBA
          2K playstyle is nothing to sneeze at as I will completely obliterate my enemies using any team. Don't @ me.
        </p>
      </MediaObject>
    </Card>

    <Card>
      <MediaObject media={<BitcoinIcon className='w-16 h-16 text-yellow-300' />}>
        <h4 className='text-lg font-bold'>Cryptocurrency</h4>
        <p className='mt-1'>
          I watched in agony as Elon Musk single-handedly boosted Bitcoin's price the moment I sell off my meager
          earnings. Such is the life of an amateur investor. Alas, I continue my struggle despite my rugged beginnings.
        </p>
      </MediaObject>
    </Card>
  </div>
);

export default Hobbies;
