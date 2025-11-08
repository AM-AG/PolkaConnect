import { StatusBanner } from '../StatusBanner'

export default function StatusBannerExample() {
  return (
    <div className="space-y-4 p-6">
      <StatusBanner mode="online" />
      <StatusBanner mode="syncing" message="Syncing Polkadot chain data..." />
      <StatusBanner mode="cached" />
      <StatusBanner mode="offline" message="RPC node offline. Using local cache." />
    </div>
  )
}
