'use client';

import { useParams } from 'next/navigation';

export default function TestEdit() {
  console.log('🔥 TEST EDIT ROUTE IS WORKING');
  const params = useParams();

  return (
    <div style={{ padding: '20px', fontSize: '20px' }}>
      <h1>🔥 TEST EDIT ROUTE WORKS!</h1>
      <p>If you can see this, dynamic routing is working.</p>
      <p>Params: {JSON.stringify(params)}</p>
      <p>Check console for debug message.</p>
    </div>
  );
}