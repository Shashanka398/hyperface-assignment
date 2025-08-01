import { Typography } from 'antd';

const { Title, Text } = Typography;

const Rules=()=>{
    return (
           <div className="login-rules">
            <Title level={5}>Game Rules:</Title>
            <ul style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
              <li>Rock beats Scissors</li>
              <li>Scissors beats Paper</li>
              <li>Paper beats Rock</li>
              <li>Each tab is a separate player</li>
            </ul>
          </div>
    )
}

export default Rules;