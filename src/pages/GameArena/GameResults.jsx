import React from "react";
import { Button, Row, Col, Typography, Space } from "antd";
import GameChoiceDisplay from "./GameChoiceDisplay";
import {
  GAME_RESULTS,
  NOTIFICATION_MESSAGES,
} from "../../constants/common.constants";
import { PlayCircleOutlined, RollbackOutlined } from "@ant-design/icons";

const { Text } = Typography;

const GameResults = ({
  playerChoice,
  opponentChoice,
  choices,
  gameResult,
  currentUser,
  opponent,
  onReturnToLobby,
  replayRequestSent = false,
  replayRequestReceived = false,
  onRequestReplay,
  onAcceptReplay,
  onDeclineReplay,
}) => {
  const getResultText = () => {
    if (!gameResult) return null;
    if (gameResult === currentUser) {
      return {
        text: NOTIFICATION_MESSAGES.YOU_WIN,
        color: "var(--success-color)",
      };
    } else if (gameResult === GAME_RESULTS.DRAW) {
      return {
        text: NOTIFICATION_MESSAGES.ITS_A_DRAW,
        color: "var(--warning-color)",
      };
    } else {
      return {
        text: NOTIFICATION_MESSAGES.YOU_LOSE,
        color: "var(--error-color)",
      };
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Row gutter={24} style={{ marginBottom: "32px" }}>
        <Col span={8} style={{ textAlign: "center" }}>
          <GameChoiceDisplay
            choice={playerChoice}
            choices={choices}
            label="You chose:"
          />
        </Col>
        <Col
          span={8}
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="vs-divider">VS</div>
        </Col>
        <Col span={8} style={{ textAlign: "center" }}>
          <GameChoiceDisplay
            choice={opponentChoice}
            choices={choices}
            label={`${opponent} chose:`}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: "24px" }}>
        <Text
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: getResultText()?.color,
            display: "block",
          }}
        >
          {getResultText()?.text}
        </Text>
      </div>

      {replayRequestReceived ? (
        <div style={{ marginBottom: "16px" }}>
          <Text
            style={{ fontSize: "18px", display: "block", marginBottom: "16px" }}
          >
            {opponent} wants to play again!
          </Text>
          <Space size="large">
            <Button type="primary" size="large" onClick={onAcceptReplay}>
              Accept Replay
            </Button>
            <Button size="large" onClick={onDeclineReplay}>
              Decline
            </Button>
          </Space>
        </div>
      ) : replayRequestSent ? (
        <div style={{ marginBottom: "16px" }}>
          <Text
            style={{ fontSize: "18px", display: "block", marginBottom: "16px" }}
          >
            Waiting for {opponent} to respond...
          </Text>
          <Button size="large" loading>
            Replay Request Sent
          </Button>
        </div>
      ) : (
        <div style={{ marginBottom: "16px" }}>
          <Space size="large">
            <Button
              size="large"
              icon={<RollbackOutlined />}
              onClick={onReturnToLobby}
            >
              Lobby
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="large"
              onClick={onRequestReplay}
            >
              Play Again
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default GameResults;
