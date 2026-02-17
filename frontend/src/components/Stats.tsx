interface StatsProps {
  slice: any;
}

export function Stats({ slice }: StatsProps) {
  if (!slice || slice.size === 0) {
    return (
      <div style={{
        background: 'rgba(255, 68, 68, 0.1)',
        border: '2px solid #FF4444',
        borderRadius: '10px',
        padding: '20px',
        height: 'fit-content',
      }}>
        <h2 className="neon-text" style={{ fontSize: '24px', marginBottom: '15px', textAlign: 'center' }}>
          STATS
        </h2>
        <div style={{ color: '#FFD700', textAlign: 'center' }}>
          Waiting to spawn...
        </div>
      </div>
    );
  }
  
  const size = Number(slice.size);
  const eats = Number(slice.eats);
  const toppingEats = Number(slice.toppingEats);
  const isRespawning = slice.respawn > 0;
  
  return (
    <div style={{
      background: 'rgba(255, 68, 68, 0.1)',
      border: '2px solid #FF4444',
      borderRadius: '10px',
      padding: '20px',
      height: 'fit-content',
    }}>
      <h2 className="neon-text" style={{ fontSize: '24px', marginBottom: '15px', textAlign: 'center' }}>
        STATS
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <div style={{ color: '#FFD700', fontSize: '18px', marginBottom: '5px' }}>Size</div>
          <div style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold' }}>
            {Math.floor(size / 100) / 10}k
          </div>
        </div>
        
        <div>
          <div style={{ color: '#FFD700', fontSize: '18px', marginBottom: '5px' }}>Players Eaten</div>
          <div style={{ color: '#FFFFFF', fontSize: '20px' }}>{eats}</div>
        </div>
        
        <div>
          <div style={{ color: '#FFD700', fontSize: '18px', marginBottom: '5px' }}>Toppings Eaten</div>
          <div style={{ color: '#FFFFFF', fontSize: '20px' }}>{toppingEats}</div>
        </div>
        
        {isRespawning && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.3)',
            padding: '10px',
            borderRadius: '5px',
            textAlign: 'center',
            color: '#FFD700',
          }}>
            Respawning...
          </div>
        )}
      </div>
    </div>
  );
}
