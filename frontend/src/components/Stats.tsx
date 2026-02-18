interface StatsProps {
  slice: any;
  blockNumber?: bigint;
  spawnError?: string | null;
  onSpawn?: () => void;
}

export function Stats({ slice, blockNumber = 0n, spawnError, onSpawn }: StatsProps) {
  if (!slice || slice.size === 0) {
    const respawn = Number(slice?.respawn ?? 0);
    const blockNum = Number(blockNumber ?? 0);
    const blocksLeft = respawn > 0 ? Math.max(0, respawn - blockNum) : 0;
    const canSpawn = !slice || respawn === 0 || blockNum >= respawn;

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
          <div style={{ marginBottom: '10px' }}>
            {canSpawn ? 'Waiting to spawn...' : `Respawning in ${blocksLeft} blocks...`}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '15px' }}>Press WASD or Arrow keys, or click below:</div>
          {spawnError && <div style={{ color: '#FF6666', fontSize: '14px', marginBottom: '10px' }}>{spawnError}</div>}
          {onSpawn && (
            <button
              onClick={onSpawn}
              disabled={!canSpawn}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontFamily: 'Bungee',
                background: canSpawn ? '#FF4444' : '#666',
                color: '#FFD700',
                border: `2px solid ${canSpawn ? '#FFD700' : '#444'}`,
                borderRadius: '8px',
                cursor: canSpawn ? 'pointer' : 'not-allowed',
                boxShadow: canSpawn ? '0 0 15px #FF4444' : 'none',
                opacity: canSpawn ? 1 : 0.7,
              }}
            >
              Spawn
            </button>
          )}
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
