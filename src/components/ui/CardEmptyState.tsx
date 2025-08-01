import React ,{cloneElement} from 'react';
import { TrophyOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
const { Text } = Typography;


const CardEmptyState=({title, discription, icon = <TrophyOutlined />})=>{
    return (
         <div className="empty-card">
          {cloneElement(icon, { 
            style: { 
              fontSize: '28px', 
              color: 'var(--text-secondary)', 
              marginBottom: '16px',
              ...icon.props?.style 
            } 
          })}
          <Text type="secondary" style={{ fontSize: '16px', display: 'block' }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {discription}
           </Text>
          </div>

    )
}

export default CardEmptyState;