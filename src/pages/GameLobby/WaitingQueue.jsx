import React from "react";
import { Card, Typography, Space } from "antd";
import { NOTIFICATION_MESSAGES } from "../../constants/common.constants";
import {TrophyOutlined} from '@ant-design/icons'

const { Text } = Typography;

const WaitingQueue = ({ waitingQueue, currentUser }) => {
  const userWaitingQueue = waitingQueue.filter(q => q.waitingPlayer === currentUser?.username);
  const playersWaitingForUser = waitingQueue.filter(q => q.targetPlayer === currentUser?.username);
  
  const hasAnyQueue = userWaitingQueue.length > 0 || playersWaitingForUser.length > 0;
  
  if (!hasAnyQueue) {
    return null;
  }

  if (!hasAnyQueue) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Text type="secondary">
          No pending challenges or waiting queue
        </Text>
      </div>
    );
  }

  return (
    <>
      {userWaitingQueue.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong style={{ fontSize: "14px", color: "var(--warning-color)" }}>
                              {NOTIFICATION_MESSAGES.YOURE_WAITING_FOR}
          </Text>
          <Space
            direction="vertical"
            style={{ width: "100%", marginTop: "8px" }}
            size="small"
          >
            {userWaitingQueue.map((queueItem) => (
              <Card
                key={queueItem.id}
                size="small"
                style={{ width: "100%", backgroundColor: "var(--bg-secondary)" }}
              >
                <div>
                  <Text style={{ fontSize: "14px" }}>
                    {NOTIFICATION_MESSAGES.WAITING_FOR_PLAYER.replace('{player}', queueItem.targetPlayer)}
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      Since: {new Date(queueItem.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </div>
      )}

      {playersWaitingForUser.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong style={{ fontSize: "14px", color: "var(--success-color)" }}>
                              {NOTIFICATION_MESSAGES.PLAYERS_WAITING_FOR_YOU}
          </Text>
          <Space
            direction="vertical"
            style={{ width: "100%", marginTop: "8px" }}
            size="small"
          >
            {playersWaitingForUser.map((queueItem) => (
              <Card
                key={queueItem.id}
                size="small"
                style={{ width: "100%", backgroundColor: "var(--bg-secondary)" }}
              >
                <div>
                  <Text style={{ fontSize: "14px" }}>
                    {NOTIFICATION_MESSAGES.PLAYER_WAITING_FOR_YOU.replace('{player}', queueItem.waitingPlayer)}
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      Waiting since: {new Date(queueItem.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </div>
      )}
    </>
  );
};

export default WaitingQueue;
