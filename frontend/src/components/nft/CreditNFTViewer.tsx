'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAccount, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { useCreditNFT, useCreditOracle, formatCreditScore } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'
import { CONTRACTS } from '@/lib/contracts'

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
  const { data: nftBalanceData } = creditNFT.useBalanceOf(address!)
  const { data: creditProfileData } = creditOracle.useCreditProfile(address!)
  
  // Get user's token ID
  const { data: userTokenId, error: tokenIdError } = useReadContract({
    address: CONTRACTS.CreditNFT.address,
    abi: CONTRACTS.CreditNFT.abi,
    functionName: 'getTokenIdByUser',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Get token URI if user has NFT
  const { data: tokenURI, error: tokenURIError } = useReadContract({
    address: CONTRACTS.CreditNFT.address,
    abi: CONTRACTS.CreditNFT.abi,
    functionName: 'tokenURI',
    args: userTokenId && userTokenId > 0n ? [userTokenId] : undefined,
    query: { enabled: !!(userTokenId && userTokenId > 0n) }
  })

  // Update NFT balance in store
  useEffect(() => {
    if (nftBalanceData) {
      setNftBalance(Number(nftBalanceData))
    }
  }, [nftBalanceData, setNftBalance])

  // Generate NFT metadata based on credit score
  const generateNFTMetadata = useCallback((score: number): NFTMetadata => {
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
  }, [])

  // Process NFT data from contract
  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    // Handle errors from contract calls
    if (tokenIdError || tokenURIError) {
      console.error('Contract read errors:', { tokenIdError, tokenURIError })
      addNotification({
        type: 'error',
        title: 'Contract Read Error',
        description: 'Could not fetch NFT data from contract. Please check network connection.',
      })
      setIsLoading(false)
      return
    }

    if (nftBalanceData === 0n || !userTokenId || userTokenId === 0n) {
      setUserNFTs([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      let metadata = generateNFTMetadata(creditScore) // fallback
      let actualTokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      
      // If we have tokenURI from contract, use it
      if (tokenURI && typeof tokenURI === 'string') {
        actualTokenURI = tokenURI
        // Try to decode the base64 JSON metadata from contract
        try {
          if (tokenURI.startsWith('data:application/json;base64,')) {
            const base64Data = tokenURI.split(',')[1]
            const decodedData = JSON.parse(atob(base64Data))
            metadata = {
              name: decodedData.name || metadata.name,
              description: decodedData.description || metadata.description,
              image: decodedData.image || metadata.image,
              attributes: decodedData.attributes || metadata.attributes
            }
          }
        } catch (decodeError) {
          console.warn('Could not decode contract metadata, using fallback:', decodeError)
        }
      }

      const nft: CreditNFT = {
        tokenId: userTokenId,
        owner: address,
        creditScore: creditScore,
        tokenURI: actualTokenURI,
        metadata: metadata,
      }

      setUserNFTs([nft])
    } catch (error) {
      console.error('Error processing NFT data:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Load NFTs',
        description: 'Could not process your Credit NFT data',
      })
      setUserNFTs([])
    } finally {
      setIsLoading(false)
    }
  }, [address, nftBalanceData, userTokenId, tokenURI, creditScore, addNotification, generateNFTMetadata, tokenIdError, tokenURIError])

  // Generate NFT image URL based on credit score (matches contract design)
  const generateNFTImage = (score: number, color: string): string => {
    // Get tier colors that match the contract
    const getColorsForScore = (creditScore: number) => {
      if (creditScore >= 800) return { bg1: '#1a5f3f', bg2: '#2d8f6f' } // Excellent - Green
      if (creditScore >= 740) return { bg1: '#1a4f5f', bg2: '#2d7f8f' } // Very Good - Teal
      if (creditScore >= 670) return { bg1: '#1a3f5f', bg2: '#2d5f8f' } // Good - Blue
      if (creditScore >= 580) return { bg1: '#5f4f1a', bg2: '#8f7f2d' } // Fair - Orange
      return { bg1: '#5f1a1a', bg2: '#8f2d2d' } // Poor - Red
    }

    const { bg1, bg2 } = getColorsForScore(score)
    const tier = score >= 800 ? 'Excellent' : score >= 740 ? 'Very Good' : score >= 670 ? 'Good' : score >= 580 ? 'Fair' : 'Poor'

    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500" width="350" height="500">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bg1}"/>
            <stop offset="100%" style="stop-color:${bg2}"/>
          </linearGradient>
        </defs>
        <rect width="350" height="500" fill="url(#bg)"/>
        <rect x="20" y="20" width="310" height="460" rx="15" fill="rgba(255,255,255,0.1)"/>
        <text x="175" y="60" font-family="Arial,sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">CREDISOMNIA</text>
        <text x="175" y="85" font-family="Arial,sans-serif" font-size="12" text-anchor="middle" fill="rgba(255,255,255,0.7)">Credit Score NFT</text>
        <rect x="40" y="120" width="270" height="280" rx="10" fill="rgba(255,255,255,0.2)"/>
        <text x="175" y="180" font-family="Arial,sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${score}</text>
        <text x="175" y="210" font-family="Arial,sans-serif" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.9)">${tier}</text>
        <text x="60" y="250" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Repayments: 0</text>
        <text x="60" y="275" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Streak: 0</text>
        <text x="60" y="300" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Member Since: ${new Date().getFullYear()}</text>
        <text x="175" y="450" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="rgba(255,255,255,0.6)">Soulbound - Non-Transferable</text>
        <text x="175" y="470" font-family="Arial,sans-serif" font-size="8" text-anchor="middle" fill="rgba(255,255,255,0.5)">Somnia Network</text>
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

      {/* NFT Preview for different scores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">NFT Preview Gallery</h3>
          <p className="text-sm text-gray-500 mt-1">
            See how your NFT evolves with different credit scores
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[300, 600, 700, 750, 850].map((score) => {
              const previewMetadata = generateNFTMetadata(score)
              const tier = score >= 800 ? 'Excellent' : score >= 740 ? 'Very Good' : score >= 670 ? 'Good' : score >= 580 ? 'Fair' : 'Poor'
              return (
                <div 
                  key={score} 
                  className="text-center group cursor-pointer transform transition-all duration-200 hover:scale-105"
                >
                  <div className="aspect-[7/10] relative mb-2 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <Image
                      src={previewMetadata.image}
                      alt={`Credit Score ${score}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <div className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Preview
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{score}</div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      score >= 800 ? 'bg-green-100 text-green-800' :
                      score >= 740 ? 'bg-blue-100 text-blue-800' :
                      score >= 670 ? 'bg-purple-100 text-purple-800' :
                      score >= 580 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tier}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

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
                    <div className="aspect-square relative">
                      <Image
                        src={nft.metadata.image}
                        alt={nft.metadata.name}
                        fill
                        className="object-cover"
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
                <div className="relative">
                  <Image
                    src={selectedNFT.metadata.image}
                    alt={selectedNFT.metadata.name}
                    width={400}
                    height={400}
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