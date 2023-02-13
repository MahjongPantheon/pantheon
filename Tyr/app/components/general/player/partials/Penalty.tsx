import React from 'react';

type PenaltyProps = {
  children: number;
};

export const Penalty: React.FC<PenaltyProps> = ({ children }) => (
  <div className='player__penalty'>{`${children / 1000}k`}</div>
);
