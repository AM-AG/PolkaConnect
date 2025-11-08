import { ProposalCard } from '../ProposalCard'

export default function ProposalCardExample() {
  return (
    <div className="space-y-4 p-6 max-w-3xl">
      <ProposalCard
        id={123}
        title="Increase Validator Count to 350"
        proposer="5GrwvaEF...kutQY"
        status="active"
        ayeVotes={1250}
        nayVotes={320}
        deadline="2 days"
        description="This proposal suggests increasing the active validator set from 297 to 350 validators to improve network decentralization and security."
      />
      <ProposalCard
        id={122}
        title="Treasury Spend for Development Grant"
        proposer="5HpG9w8E...vFwbx"
        status="passed"
        ayeVotes={2100}
        nayVotes={450}
        deadline="Ended"
        description="Approved funding for core infrastructure development."
      />
    </div>
  )
}
