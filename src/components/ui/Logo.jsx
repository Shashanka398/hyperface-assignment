const Logo = ({ width = '64px', height = '64px', ...props }) => (
  <img 
    src="/public/hyper-face.png" 
    alt="Hyper Clash Logo" 
    style={{ width, height, marginRight: '8px' }}
    {...props} 
  />
);

export default Logo;