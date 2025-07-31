import React from "react";
import { Card, Button, Typography, Space } from "antd";

const { Text } = Typography;

const PendingChallenges = ({ 
  pendingChallenges, 
  onAcceptChallenge, 
  onRejectChallenge 
}) => {
  if (pendingChallenges.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <Space
        direction="vertical"
        style={{ width: "100%", marginTop: "8px" }}
        size="small"
      >
        {pendingChallenges.map((challenge) => {
          const timeLeft = Math.max(
            0,
            challenge.expiresAt - Date.now()
          );
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);

          return (
            <Card
              key={challenge.id}
              size="small"
              style={{ width: "100%" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space direction="vertical">
                  <Space direction="horizontal" size="small">
                    <Text strong style={{ fontSize: "12px" }}>
                      {challenge.challenger} challenges you!
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      ⏰ : {minutes}:
                      {seconds.toString().padStart(2, "0")}
                    </Text>
                  </Space>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => onAcceptChallenge(challenge.id)}
                    >
                      ✓ Accept
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={() => onRejectChallenge(challenge.id)}
                    >
                      ✗ Reject
                    </Button>
                  </Space>
                </Space>
              </div>
            </Card>
          );
        })}
      </Space>
    </div>
  );
};

export default PendingChallenges;