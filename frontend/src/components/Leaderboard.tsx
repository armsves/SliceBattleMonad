interface LeaderboardProps {
  data: Array<{ address: string; size: number; eats: number }>;
  playerAddress: string;
}

const medals = ['🥇', '🥈', '🥉'];

export function Leaderboard({ data, playerAddress }: LeaderboardProps) {
  return (
    <div style={{
      background: 'rgba(255, 68, 68, 0.1)',
      border: '2px solid #FF4444',
      borderRadius: '10px',
      padding: '20px',
      height: 'fit-content',
    }}>
      <h2 className="neon-text" style={{ fontSize: '24px', marginBottom: '15px', textAlign: 'center' }}>
        LEADERBOARD
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.length === 0 ? (
          <div style={{ color: '#FFD700', textAlign: 'center', padding: '20px' }}>
            No players yet
          </div>
        ) : (
          data.map((entry, index) => {
            const isPlayer = entry.address.toLowerCase() === playerAddress.toLowerCase();
            const shortAddr = `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`;
            
            return (
              <div
                key={entry.address}
                style={{
                  background: isPlayer ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 68, 68, 0.1)',
                  border: `2px solid ${isPlayer ? '#FFD700' : '#FF4444'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '24px' }}>
                  {index < 3 ? medals[index] : `${index + 1}.`}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: isPlayer ? '#FFD700' : '#FFFFFF' }}>
                    {isPlayer ? 'YOU' : shortAddr}
                  </div>
                  <div style={{ fontSize: '14px', color: '#FFD700' }}>
                    {Math.floor(entry.size / 100) / 10}k ({entry.eats} eats)
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
