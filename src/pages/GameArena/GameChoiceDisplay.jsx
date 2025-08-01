import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const GameChoiceDisplay = ({ choice, choices, label, size = 'large' }) => {
  const choiceData = choices.find(c => c.id === choice);
  
  if (!choiceData) return null;

  const fontSize = size === 'large' ? '48px' : size === 'medium' ? '32px' : '24px';

  return (
    <div style={{ textAlign: 'center' }}>
      <Text>{label}</Text>
      <div style={{ fontSize, margin: '8px 0' }}>
        {choiceData.emoji}
      </div>
      <Text>{choiceData.name}</Text>
    </div>
  );
};

export default GameChoiceDisplay;