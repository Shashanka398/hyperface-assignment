import React from 'react';
import { Button } from 'antd';
import { OverlayLoading } from '../../components/ui';
import { NOTIFICATION_MESSAGES } from '../../constants/common.constants';

const ChoiceSelector = ({ choices, onChoiceSelect, disabled = false, loading = false }) => {
  return (
    <div className="choices-grid">
      {choices.map(choice => (
        <OverlayLoading key={choice.id} spinning={loading} message={NOTIFICATION_MESSAGES.GAME_CHOICE_DONE}>
          <Button
            className={`game-choice-btn ${choice.id}`}
            onClick={() => onChoiceSelect(choice.id)}
            disabled={disabled || loading}
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '32px' }}>{choice.emoji}</span>
            <span style={{ fontSize: '12px' }}>{choice.name}</span>
          </Button>
        </OverlayLoading>
      ))}
    </div>
  );
};

export default ChoiceSelector;