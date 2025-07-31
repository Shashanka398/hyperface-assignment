import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notification, Button, Space, Card, Typography, Avatar } from 'antd';
import { UserOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const ChallengeNotification = ({ challenge, onAccept, onReject }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, challenge.expiresAt - Date.now());
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [challenge.expiresAt]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    try {
      const result = await onAccept(challenge.id);
      notification.success({
        message: 'Challenge Accepted!',
        description: `Starting game with ${challenge.challenger}...`,
        duration: 2,
      });     
      navigate(`/game/${result.gameSessionId}`);
    } catch (error) {
      notification.error({
        message: 'Challenge Failed',
        description: error.message,
        duration: 3,
      });
    }
  };

  const handleReject = async () => {
    try {
      await onReject(challenge.id);
      notification.info({
        message: 'Challenge Rejected',
        description: `You declined ${challenge.challenger}'s challenge.`,
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message,
        duration: 3,
      });
    }
  };

  if (timeLeft <= 0) {
    return null; 
  }

  return (
    <Card 
      size="small"
      style={{ 
        width: 350,
        background: 'var(--bg-card)',
        border: '2px solid var(--primary-color)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(24, 144, 255, 0.2)'
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-color)' }} />
          <div style={{ flex: 1 }}>
            <Text strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
              {challenge.challenger} challenges you!
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <ClockCircleOutlined style={{ color: 'var(--warning-color)', fontSize: '12px' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Expires in {formatTime(timeLeft)}
              </Text>
            </div>
          </div>
        </div>

        <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
          Ready for a Rock Paper Scissors battle?
        </Text>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            size="small"
            onClick={handleAccept}
            style={{ flex: 1 }}
          >
            Accept
          </Button>
          <Button 
            danger 
            icon={<CloseOutlined />} 
            size="small"
            onClick={handleReject}
            style={{ flex: 1 }}
          >
            Decline
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export const useChallengeNotifications = (user, gameState, crossTabSync) => {
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const shownNotifications = useRef(new Set()).current;
  const lastState = useRef(null);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.warn('Notification permission request failed:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  const showPushNotification = useCallback((title, body, icon) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/vite.svg',
          tag: 'rps-challenge',
          requireInteraction: true
        });
      } catch (error) {
        console.warn('Failed to show push notification:', error);
      }
    }
  }, []);

  const showChallengeNotification = useCallback((challenge) => {
    if (!user) return;
    const key = `challenge_${challenge.id}`;    
    if (shownNotifications.has(challenge.id)) {
      return;
    }
    shownNotifications.add(challenge.id);
    
    notification.open({
      key,
      message: null,
      description: (
        <ChallengeNotification 
          challenge={challenge}
          onAccept={async (challengeId) => {
            try {
              const result = gameState.acceptChallenge(challengeId, user.username);
              notification.close(key);
              return result;
            } catch (error) {
              notification.error({
                message: 'Challenge Failed',
                description: error.message,
              });
              throw error;
            }
          }}
          onReject={async (challengeId) => {
            try {
              gameState.rejectChallenge(challengeId, user.username);
              notification.close(key);
            } catch (error) {
              console.error('Error rejecting challenge:', error);
            }
          }}
        />
      ),
      duration: 0,
      placement: 'topRight',
      style: { padding: 0 },
      onClose: () => {
        shownNotifications.delete(challenge.id);
        if (challenge.status === 'pending') {
          try {
            gameState.rejectChallenge(challenge.id, user.username);
          } catch (error) {
             console.error('Error rejecting challenge:', error);
          }
        }
      }
    });

    const timeLeft = challenge.expiresAt - Date.now();
    if (timeLeft > 0) {
      setTimeout(() => {
        try {
          notification.destroy(key);
        } catch (e) {
          // Fallback if destroy doesn't work
          console.log('Could not close notification:', e);
        }
        shownNotifications.delete(challenge.id);
      }, timeLeft);
    }
  }, [user, gameState]);

  // Load challenges with debouncing
  const loadChallenges = useCallback(() => {
    if (!user) return;

    try {
      const challenges = gameState.getPendingChallenges(user.username);
      const challengesStr = JSON.stringify(challenges);
      
      // Only update if challenges actually changed
      if (lastState.current !== challengesStr) {
        lastState.current = challengesStr;
        setPendingChallenges(challenges);
        
        // Show notifications for new challenges
        challenges.forEach(challenge => {
          if (!shownNotifications.has(challenge.id)) {
            showChallengeNotification(challenge);
          }
        });
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  }, [user, gameState, showChallengeNotification]);

  useEffect(() => {
    if (!user) return;
    loadChallenges();
    let timeoutId;
    const unsubscribe = crossTabSync.subscribe(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(loadChallenges, 300);
    });
    const interval = setInterval(() => {
      gameState.cleanupExpiredChallenges();
      loadChallenges();
    }, 20000); 

    return () => {
      unsubscribe();
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [user, loadChallenges, gameState, crossTabSync]);

  return {
    pendingChallenges,
    requestPermission,
    showPushNotification
  };
};

export default ChallengeNotification;