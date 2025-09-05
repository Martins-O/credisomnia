'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { useCreditNFT, useCreditOracle, formatCreditScore } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

interface CreditNFT {
  tokenId: bigint
  owner: Address
  creditScore: number
  metadata: NFTMetadata
  tokenURI: string
}

export default function CreditNFTViewer() {
  const { address } = useAccount()
  const { addNotification } = useNotificationStore()
  const { creditScore, nftBalance, setNftBalance } = useDefiStore()

  // Contract hooks
  const creditNFT = useCreditNFT()
  const creditOracle = useCreditOracle()

  // Local state
  const [userNFTs, setUserNFTs] = useState<CreditNFT[]>([])
  const [selectedNFT, setSelectedNFT] = useState<CreditNFT | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMinting, setIsMinting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch NFT data
  const { data: nftBalanceData } = creditNFT.balanceOf(address!)
  const { data: creditProfileData } = creditOracle.getCreditProfile(address!)

  // Update NFT balance in store
  useEffect(() => {
    if (nftBalanceData) {
      setNftBalance(Number(nftBalanceData))
    }
  }, [nftBalanceData, setNftBalance])

  // Fetch user's NFTs
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!address || !nftBalanceData || nftBalanceData === 0n) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        const nfts: CreditNFT[] = []
        
        // In a real implementation, you would iterate through token IDs
        // For now, we'll simulate with mock data based on user's credit score
        if (Number(nftBalanceData) > 0) {
          const mockNFT: CreditNFT = {
            tokenId: 1n,
            owner: address,
            creditScore: creditScore,
            tokenURI: `https://api.credisomnia.com/nft/metadata/1`,
            metadata: generateNFTMetadata(creditScore),
          }
          nfts.push(mockNFT)
        }

        setUserNFTs(nfts)
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        addNotification({
          type: 'error',
          title: 'Failed to Load NFTs',
          description: 'Could not fetch your Credit NFTs',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserNFTs()
  }, [address, nftBalanceData, creditScore, addNotification])

  // Generate NFT metadata based on credit score
  const generateNFTMetadata = (score: number): NFTMetadata => {
    const getScoreTier = (score: number) => {
      if (score >= 800) return { tier: 'Excellent', color: '#10B981', rarity: 'Legendary' }
      if (score >= 740) return { tier: 'Very Good', color: '#3B82F6', rarity: 'Epic' }
      if (score >= 670) return { tier: 'Good', color: '#8B5CF6', rarity: 'Rare' }
      if (score >= 580) return { tier: 'Fair', color: '#F59E0B', rarity: 'Uncommon' }
      return { tier: 'Poor', color: '#EF4444', rarity: 'Common' }
    }

    const { tier, color, rarity } = getScoreTier(score)

    return {
      name: `Credit Score NFT - ${tier}`,
      description: `A dynamic NFT representing your DeFi credit score of ${score}. This NFT evolves as your credit score changes through responsible borrowing and saving behavior.`,
      image: generateNFTImage(score, color),
      attributes: [
        { trait_type: 'Credit Score', value: score },
        { trait_type: 'Score Tier', value: tier },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Network', value: 'Somnia Testnet' },
        { trait_type: 'Protocol', value: 'Credisomnia' },
        { trait_type: 'Last Updated', value: new Date().toISOString().split('T')[0] }
      ]
    }
  }

  // Generate NFT image URL based on credit score
  const generateNFTImage = (score: number, color: string): string => {
    // In a real implementation, this would generate actual NFT images
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bg)" rx="20"/>
        <circle cx="200" cy="150" r="80" fill="none" stroke="${color}" stroke-width="6"/>
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="${color}">${score}</text>
        <text x="200" y="240" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="${color}">CREDIT SCORE</text>
        <text x="200" y="320" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="${color}">Credisomnia DeFi</text>
        <text x="200" y="360" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="${color}">Somnia Network</text>
      </svg>
    `)}`
  }

  // Handle minting new NFT
  const handleMintNFT = async () => {
    if (!address || isMinting) return

    setIsMinting(true)
    
    try {
      const hash = await creditNFT.mintCreditNFT(address, BigInt(creditScore))
      
      addNotification({
        type: 'success',
        title: 'NFT Minting Started',
        description: 'Your Credit NFT is being minted. This may take a few moments.',
      })

      // Refresh NFTs after minting
      setTimeout(() => {
        window.location.reload() // Simple refresh for demo
      }, 5000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Minting Failed',
        description: error?.message || 'Failed to mint Credit NFT',
      })
    } finally {
      setIsMinting(false)
    }
  }

  // Handle updating NFT with new credit score
  const handleUpdateNFT = async (tokenId: bigint) => {
    if (!address || isUpdating) return

    setIsUpdating(true)
    
    try {
      const hash = await creditNFT.updateCreditScore(tokenId, BigInt(creditScore))
      
      addNotification({
        type: 'success',
        title: 'NFT Update Started',
        description: 'Your Credit NFT is being updated with your latest score.',
      })

      // Refresh NFTs after update
      setTimeout(() => {
        window.location.reload() // Simple refresh for demo
      }, 5000)

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        description: error?.message || 'Failed to update Credit NFT',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Get score tier info
  const getScoreTierInfo = (score: number) => {
    if (score >= 800) return { tier: 'Excellent', color: 'text-green-600 bg-green-100', description: 'Outstanding credit history' }
    if (score >= 740) return { tier: 'Very Good', color: 'text-blue-600 bg-blue-100', description: 'Strong credit profile' }
    if (score >= 670) return { tier: 'Good', color: 'text-purple-600 bg-purple-100', description: 'Solid credit standing' }
    if (score >= 580) return { tier: 'Fair', color: 'text-yellow-600 bg-yellow-100', description: 'Rebuilding credit' }
    return { tier: 'Poor', color: 'text-red-600 bg-red-100', description: 'Needs improvement' }
  }

  if (!address) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Please connect your wallet to view your Credit NFTs
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Credit NFT Collection</h2>
            <p className="text-gray-500 mt-1">
              Dynamic NFTs that evolve with your credit score
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">NFTs Owned</div>
            <div className="text-2xl font-bold text-blue-600">{nftBalance}</div>
          </div>
        </div>
      </div>

      {/* Current Credit Score */}
      {creditProfileData && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Current Credit Score</h3>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-blue-600">{creditScore}</div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreTierInfo(creditScore).color}`}>
                    {getScoreTierInfo(creditScore).tier}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {getScoreTierInfo(creditScore).description}
                  </p>
                </div>
              </div>
            </div>
            {nftBalance === 0 ? (
              <button
                onClick={handleMintNFT}
                disabled={isMinting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {isMinting ? 'Minting...' : 'Mint Credit NFT'}
              </button>
            ) : (
              <button
                onClick={() => userNFTs[0] && handleUpdateNFT(userNFTs[0].tokenId)}
                disabled={isUpdating}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {isUpdating ? 'Updating...' : 'Update NFT'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* NFT Gallery */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Credit NFTs</h3>
          <p className="text-sm text-gray-500 mt-1">
            These NFTs represent your creditworthiness and can be used as collateral or social proof
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading your NFTs...</p>
          </div>
        ) : userNFTs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🖼️</div>
            <p className="text-gray-500 mb-4">You don't have any Credit NFTs yet</p>
            <button
              onClick={handleMintNFT}
              disabled={isMinting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isMinting ? 'Minting...' : 'Mint Your First Credit NFT'}
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.map((nft) => {
                const tierInfo = getScoreTierInfo(nft.creditScore)
                return (
                  <div
                    key={nft.tokenId.toString()}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <div className="aspect-square">
                      <img
                        src={nft.metadata.image}
                        alt={nft.metadata.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {nft.metadata.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {nft.metadata.description}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tierInfo.color}`}>
                          {tierInfo.tier}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          #{nft.tokenId.toString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* NFT Details Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedNFT.metadata.name}
                </h3>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedNFT.metadata.image}
                    alt={selectedNFT.metadata.name}
                    className="w-full rounded-lg"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 mb-4">{selectedNFT.metadata.description}</p>

                  <h4 className="font-semibold text-gray-900 mb-2">Attributes</h4>
                  <div className="space-y-2">
                    {selectedNFT.metadata.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">{attr.trait_type}</span>
                        <span className="font-medium text-gray-900">{attr.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        handleUpdateNFT(selectedNFT.tokenId)
                        setSelectedNFT(null)
                      }}
                      disabled={isUpdating}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {isUpdating ? 'Updating...' : 'Update Credit Score'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedNFT.tokenURI)
                        addNotification({
                          type: 'success',
                          title: 'Copied to Clipboard',
                          description: 'Token URI copied to clipboard',
                        })
                      }}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 font-medium"
                    >
                      Copy Token URI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}