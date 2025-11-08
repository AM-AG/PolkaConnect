import { NetworkMap } from '../NetworkMap'

export default function NetworkMapExample() {
  const nodes = [
    { id: 'polkadot', name: 'Polkadot', blockHeight: 18234567, uptime: 99.9, status: 'online' as const, x: 400, y: 80 },
    { id: 'astar', name: 'Astar', blockHeight: 5123456, uptime: 99.5, status: 'online' as const, x: 250, y: 200 },
    { id: 'moonbeam', name: 'Moonbeam', blockHeight: 4567890, uptime: 98.2, status: 'syncing' as const, x: 550, y: 200 },
    { id: 'acala', name: 'Acala', blockHeight: 3987654, uptime: 99.7, status: 'online' as const, x: 150, y: 320 },
    { id: 'parallel', name: 'Parallel', blockHeight: 2876543, uptime: 99.3, status: 'online' as const, x: 650, y: 320 },
  ];

  return <NetworkMap nodes={nodes} />
}
