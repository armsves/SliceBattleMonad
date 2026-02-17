interface TXCounterProps {
  txCount: number;
  blockTxCount: number;
  blockNumber: bigint;
}

export function TXCounter({ txCount, blockTxCount, blockNumber }: TXCounterProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      fontFamily: 'Press Start 2P',
      fontSize: '12px',
    }}>
      <div style={{
        background: 'rgba(255, 68, 68, 0.2)',
        border: '2px solid #FF4444',
        borderRadius: '8px',
        padding: '10px 15px',
      }}>
        <div style={{ color: '#FFD700' }}>TXs Sent</div>
        <div style={{ color: '#FFFFFF', fontSize: '16px' }}>{txCount}</div>
      </div>
      
      <div style={{
        background: 'rgba(255, 68, 68, 0.2)',
        border: '2px solid #FF4444',
        borderRadius: '8px',
        padding: '10px 15px',
      }}>
        <div style={{ color: '#FFD700' }}>TPS</div>
        <div style={{ color: '#FFFFFF', fontSize: '16px' }}>{blockTxCount}/block</div>
      </div>
      
      <div style={{
        background: 'rgba(255, 68, 68, 0.2)',
        border: '2px solid #FF4444',
        borderRadius: '8px',
        padding: '10px 15px',
      }}>
        <div style={{ color: '#FFD700' }}>Block</div>
        <div style={{ color: '#FFFFFF', fontSize: '16px' }}>#{blockNumber.toString()}</div>
      </div>
    </div>
  );
}
