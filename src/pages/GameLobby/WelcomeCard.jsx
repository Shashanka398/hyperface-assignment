import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  Space,
  Typography,
  Button
} from "antd";
import {
LogoutOutlined
} from "@ant-design/icons";


const {  Text ,Title} = Typography;


const WelcomeCard = () => {
const {user,logout}= useAuth()

  const handleLogout = () => {
    logout();
  };

return (
      <Card>
          <div className="flex-between">
            <div>
              <Title
                level={3}
                style={{ margin: 0 }}
              >
                Welcome, {user?.username}! 👋
              </Title>
              <Text type="secondary">
                You're in the game lobby. Ready to play?
              </Text>
       
            </div>
            <Space>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                type="text"
              >
                Logout
              </Button>
            </Space>
          </div>
        </Card>

)
}
export default WelcomeCard;