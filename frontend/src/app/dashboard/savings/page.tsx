import SavingsVault from '@/components/savings/SavingsVault'

export default function SavingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Savings Vault</h1>
        <p className="text-gray-500 mt-1">
          Deposit funds to earn rewards and improve your credit score
        </p>
      </div>
      
      <SavingsVault />
    </div>
  )
}