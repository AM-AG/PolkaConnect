import { BalanceCard } from '../BalanceCard'

export default function BalanceCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <BalanceCard
        chainName="Polkadot"
        chainIcon="●"
        balance="142.50"
        usdValue="1,425.00"
        lastUpdated="2 mins ago"
        status="online"
      />
      <BalanceCard
        chainName="Astar"
        chainIcon="★"
        balance="8,432.10"
        usdValue="842.32"
        lastUpdated="5 mins ago"
        status="online"
      />
      <BalanceCard
        chainName="Moonbeam"
        chainIcon="◐"
        balance="256.75"
        usdValue="512.45"
        lastUpdated="1 min ago"
        status="syncing"
      />
    </div>
  )
}
