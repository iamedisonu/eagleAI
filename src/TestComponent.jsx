import React from 'react';

const TestComponent = () => {
  console.log('TestComponent is rendering');
  
  return (
    <div style={{
      padding: '50px',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      color: 'white',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{fontSize: '48px', marginBottom: '20px'}}>
        🎉 EagleAI is Working! 🎉
      </h1>
      <p style={{fontSize: '24px', marginBottom: '30px'}}>
        If you can see this, React is rendering correctly!
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '20px',
        borderRadius: '10px',
        fontSize: '18px'
      }}>
        <p>✅ React is working</p>
        <p>✅ Components are rendering</p>
        <p>✅ CSS is loading</p>
        <p>✅ JavaScript is executing</p>
      </div>
    </div>
  );
};

export default TestComponent;
