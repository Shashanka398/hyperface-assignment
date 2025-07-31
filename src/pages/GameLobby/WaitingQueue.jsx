import React from "react";
import { Card, Typography, Space } from "antd";

const { Text } = Typography;

const WaitingQueue = ({ waitingQueue, currentUser }) => {
  const userWaitingQueue = waitingQueue.filter(q => q.waitingPlayer === currentUser?.username);
  const playersWaitingForUser = waitingQueue.filter(q => q.targetPlayer === currentUser?.username);
  
  const hasAnyQueue = userWaitingQueue.length > 0 || playersWaitingForUser.length > 0;
  
  if (!hasAnyQueue) {
    return null;
  }

  return (
    <>
      {userWaitingQueue.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong style={{ fontSize: "14px", color: "var(--warning-color)" }}>
            You're Waiting For
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
                    Waiting for {queueItem.targetPlayer} to finish their game
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
            Players Waiting for You
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
                    {queueItem.waitingPlayer} is waiting for you
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
