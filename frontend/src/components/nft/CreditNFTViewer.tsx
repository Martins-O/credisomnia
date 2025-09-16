'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAccount, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { useCreditNFT, useCreditOracle, formatCreditScore } from '@/lib/hooks/useContracts'
import { useDefiStore, useNotificationStore } from '@/lib/store/defi-store'
import { useCrediSom } from '@/hooks/useCrediSom'
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
  const { nftBalance, setNftBalance } = useDefiStore()
  const { creditScore, creditProfile, totalLoans, formatBalance, savingsBalance } = useCrediSom()

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

  // Update NFT balance in store with demo fallback
  useEffect(() => {
    if (nftBalanceData) {
      setNftBalance(Number(nftBalanceData))
    } else if (address) {
      // Demo: Set balance to 1 to show demo NFT
      setNftBalance(1)
    }
  }, [nftBalanceData, setNftBalance, address])

  // Generate NFT metadata based on credit score
  const generateNFTMetadata = useCallback((score: number): NFTMetadata => {
    const getScoreTier = (score: number) => {
      if (score >= 800) return { tier: 'Excellent', color: '#10B981', rarity: 'Legendary', bonus: '20% APY Boost' }
      if (score >= 740) return { tier: 'Very Good', color: '#3B82F6', rarity: 'Epic', bonus: '15% APY Boost' }
      if (score >= 670) return { tier: 'Good', color: '#8B5CF6', rarity: 'Rare', bonus: '10% APY Boost' }
      if (score >= 580) return { tier: 'Fair', color: '#F59E0B', rarity: 'Uncommon', bonus: '5% APY Boost' }
      return { tier: 'Poor', color: '#EF4444', rarity: 'Common', bonus: 'Standard Rates' }
    }

    const { tier, color, rarity, bonus } = getScoreTier(score)
    const creditScoreNumber = Number(creditScore || score)
    const savingsBalanceNumber = savingsBalance ? Number(formatBalance(savingsBalance)) : 0
    const totalLoansNumber = totalLoans || 0
    const repaymentStreak = creditProfile ? Number(creditProfile.repaymentStreak) : 0
    const memberSince = creditProfile ? new Date(Number(creditProfile.lastPaymentTime) * 1000).getFullYear() : new Date().getFullYear()

    return {
      name: `CrediSomnia Credit NFT #${Math.floor(Math.random() * 1000) + 1}`,
      description: `A dynamic soulbound NFT representing your DeFi credit profile with a score of ${creditScoreNumber}. This evolving NFT tracks your borrowing history, savings behavior, and overall creditworthiness in the decentralized finance ecosystem. Higher scores unlock better rates and exclusive benefits.`,
      image: generateNFTImage(creditScoreNumber, color, savingsBalanceNumber, totalLoansNumber, repaymentStreak),
      attributes: [
        { trait_type: 'Credit Score', value: creditScoreNumber },
        { trait_type: 'Score Tier', value: tier },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Interest Rate Bonus', value: bonus },
        { trait_type: 'Total Loans', value: totalLoansNumber },
        { trait_type: 'Repayment Streak', value: repaymentStreak },
        { trait_type: 'Savings Balance', value: `${savingsBalanceNumber.toFixed(2)} STT` },
        { trait_type: 'Member Since', value: memberSince },
        { trait_type: 'Network', value: 'Somnia Testnet' },
        { trait_type: 'Protocol', value: 'CrediSomnia' },
        { trait_type: 'Token Standard', value: 'ERC-721' },
        { trait_type: 'Soulbound', value: 'Yes' },
        { trait_type: 'Last Updated', value: new Date().toISOString().split('T')[0] }
      ]
    }
  }, [creditScore, creditProfile, totalLoans, formatBalance, savingsBalance])

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

    // Handle demo mode when no real contract data
    if ((nftBalanceData === 0n || !userTokenId || userTokenId === 0n) && !address) {
      setUserNFTs([])
      setIsLoading(false)
      return
    }
    
    // Create demo NFT if no real data but user is connected
    if ((nftBalanceData === 0n || !userTokenId || userTokenId === 0n) && address) {
      console.log('Creating demo NFT for demonstration')
      const demoMetadata = generateNFTMetadata(Number(creditScore || 745))
      const demoNFT: CreditNFT = {
        tokenId: BigInt(1), // Demo token ID
        owner: address,
        creditScore: Number(creditScore || 745),
        tokenURI: `data:application/json,${encodeURIComponent(JSON.stringify(demoMetadata))}`,
        metadata: demoMetadata,
      }
      setUserNFTs([demoNFT])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      let metadata = generateNFTMetadata(Number(creditScore || 745)) // fallback
      let actualTokenURI = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`
      
      // If we have tokenURI from contract, use it
      if (tokenURI && typeof tokenURI === 'string') {
        actualTokenURI = tokenURI
        // Try to decode the JSON metadata from contract
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
          } else if (tokenURI.startsWith('data:application/json,')) {
            const jsonData = tokenURI.split(',')[1]
            const decodedData = JSON.parse(decodeURIComponent(jsonData))
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
        tokenId: userTokenId || 1n, // Provide fallback
        owner: address,
        creditScore: Number(creditScore || 745),
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
  const generateNFTImage = (score: number, color: string, savings = 0, loans = 0, streak = 0): string => {
    // Get tier colors that match the contract
    const getColorsForScore = (creditScore: number) => {
      if (creditScore >= 800) return { bg1: '#1a5f3f', bg2: '#2d8f6f', accent: '#10B981' } // Excellent - Green
      if (creditScore >= 740) return { bg1: '#1a4f5f', bg2: '#2d7f8f', accent: '#3B82F6' } // Very Good - Teal
      if (creditScore >= 670) return { bg1: '#1a3f5f', bg2: '#2d5f8f', accent: '#8B5CF6' } // Good - Blue
      if (creditScore >= 580) return { bg1: '#5f4f1a', bg2: '#8f7f2d', accent: '#F59E0B' } // Fair - Orange
      return { bg1: '#5f1a1a', bg2: '#8f2d2d', accent: '#EF4444' } // Poor - Red
    }

    const { bg1, bg2, accent } = getColorsForScore(score)
    const tier = score >= 800 ? 'Excellent' : score >= 740 ? 'Very Good' : score >= 670 ? 'Good' : score >= 580 ? 'Fair' : 'Poor'
    const rarity = score >= 800 ? 'LEGENDARY' : score >= 740 ? 'EPIC' : score >= 670 ? 'RARE' : score >= 580 ? 'UNCOMMON' : 'COMMON'
    const memberSince = creditProfile ? new Date(Number(creditProfile.lastPaymentTime) * 1000).getFullYear() : new Date().getFullYear()

    // Create safe SVG string without problematic characters
    const svgString = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500" width="350" height="500">',
      '<defs>',
      '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
      `<stop offset="0%" style="stop-color:${bg1}"/>`,
      `<stop offset="100%" style="stop-color:${bg2}"/>`,
      '</linearGradient>',
      '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">',
      `<stop offset="0%" style="stop-color:${accent}"/>`,
      '<stop offset="100%" style="stop-color:rgba(255,255,255,0.3)"/>',
      '</linearGradient>',
      '</defs>',
      '<rect width="350" height="500" fill="url(#bg)"/>',
      '',
      '<rect x="15" y="15" width="320" height="470" rx="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>',
      '',
      '<rect x="25" y="25" width="300" height="80" rx="10" fill="rgba(255,255,255,0.1)"/>',
      '<text x="175" y="50" font-family="Arial,sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">CREDISOMNIA</text>',
      '<text x="175" y="70" font-family="Arial,sans-serif" font-size="11" text-anchor="middle" fill="rgba(255,255,255,0.8)">CREDIT SCORE NFT</text>',
      `<text x="175" y="85" font-family="Arial,sans-serif" font-size="9" text-anchor="middle" fill="url(#accent)" font-weight="bold">${rarity}</text>`,
      '',
      '<rect x="40" y="120" width="270" height="200" rx="15" fill="rgba(255,255,255,0.15)"/>',
      '<circle cx="175" cy="180" r="50" fill="rgba(255,255,255,0.2)" stroke="url(#accent)" stroke-width="3"/>',
      `<text x="175" y="195" font-family="Arial,sans-serif" font-size="42" font-weight="bold" text-anchor="middle" fill="white">${score}</text>`,
      `<text x="175" y="250" font-family="Arial,sans-serif" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.9)">${tier}</text>`,
      '<text x="175" y="270" font-family="Arial,sans-serif" font-size="11" text-anchor="middle" fill="rgba(255,255,255,0.7)">Credit Rating</text>',
      '',
      '<rect x="40" y="340" width="270" height="100" rx="10" fill="rgba(255,255,255,0.1)"/>',
      '<text x="60" y="365" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">Loans:</text>',
      `<text x="280" y="365" font-family="Arial,sans-serif" font-size="12" text-anchor="end" fill="white" font-weight="bold">${loans}</text>`,
      '',
      '<text x="60" y="385" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">Streak:</text>',
      `<text x="280" y="385" font-family="Arial,sans-serif" font-size="12" text-anchor="end" fill="white" font-weight="bold">${streak}</text>`,
      '',
      '<text x="60" y="405" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">Savings:</text>',
      `<text x="280" y="405" font-family="Arial,sans-serif" font-size="12" text-anchor="end" fill="white" font-weight="bold">${savings.toFixed(1)} STT</text>`,
      '',
      '<text x="60" y="425" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">Member Since:</text>',
      `<text x="280" y="425" font-family="Arial,sans-serif" font-size="12" text-anchor="end" fill="white" font-weight="bold">${memberSince}</text>`,
      '',
      '<text x="175" y="460" font-family="Arial,sans-serif" font-size="9" text-anchor="middle" fill="rgba(255,255,255,0.6)">SOULBOUND - NON-TRANSFERABLE</text>',
      '<text x="175" y="475" font-family="Arial,sans-serif" font-size="8" text-anchor="middle" fill="rgba(255,255,255,0.5)">SOMNIA TESTNET</text>',
      '</svg>'
    ].join('\n')
    
    // Use encodeURIComponent instead of btoa to avoid Latin1 encoding issues
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`
  }

  // Handle minting new NFT
  const handleMintNFT = async () => {
    if (!address || isMinting) return

    setIsMinting(true)
    
    try {
      const hash = await creditNFT.mintCreditNFT(address, BigInt(Number(creditScore || 745)))
      
      addNotification({
        type: 'success',
        title: 'NFT Minting Started',
        description: 'Your Credit NFT is being minted. This may take a few moments.',
      })

      // Refresh NFTs after minting
      let isMounted = true
      setTimeout(() => {
        if (isMounted) {
          window.location.reload() // Simple refresh for demo
        }
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
      const hash = await creditNFT.updateCreditScore(tokenId, BigInt(Number(creditScore || 745)))
      
      addNotification({
        type: 'success',
        title: 'NFT Update Started',
        description: 'Your Credit NFT is being updated with your latest score.',
      })

      // Refresh NFTs after update
      let isMounted = true
      setTimeout(() => {
        if (isMounted) {
          window.location.reload() // Simple refresh for demo
        }
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Current Credit Score</h3>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-blue-600">{Number(creditScore || 745)}</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreTierInfo(Number(creditScore || 745)).color}`}>
                  {getScoreTierInfo(Number(creditScore || 745)).tier}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {getScoreTierInfo(Number(creditScore || 745)).description}
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
        {!creditProfileData && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Demo Mode:</span> Credit score and NFT data shown for demonstration. 
              Connect to a live contract to see your actual credit profile.
            </p>
          </div>
        )}
      </div>

      {/* NFT Preview for different scores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">NFT Preview Gallery</h3>
          <p className="text-sm text-gray-500 mt-1">
            See how your NFT evolves with different credit scores
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { score: 350, loans: 0, savings: 50, streak: 0, label: 'New User' },
              { score: 620, loans: 1, savings: 500, streak: 2, label: 'Building Credit' },
              { score: 720, loans: 3, savings: 1200, streak: 5, label: 'Good Standing' },
              { score: 780, loans: 5, savings: 2500, streak: 12, label: 'Excellent History' },
              { score: 850, loans: 8, savings: 5000, streak: 24, label: 'Elite Member' }
            ].map((demo) => {
              const previewMetadata = generateNFTMetadata(demo.score)
              const tier = demo.score >= 800 ? 'Excellent' : demo.score >= 740 ? 'Very Good' : demo.score >= 670 ? 'Good' : demo.score >= 580 ? 'Fair' : 'Poor'
              const rarity = demo.score >= 800 ? 'Legendary' : demo.score >= 740 ? 'Epic' : demo.score >= 670 ? 'Rare' : demo.score >= 580 ? 'Uncommon' : 'Common'
              
              return (
                <div 
                  key={demo.score} 
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-white rounded-lg shadow-md group-hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="aspect-[7/10] relative">
                      <Image
                        src={generateNFTImage(demo.score, '', demo.savings, demo.loans, demo.streak)}
                        alt={`Credit Score ${demo.score}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-3 py-1 rounded-full">
                          Preview NFT
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-bold text-gray-900">{demo.score}</div>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${
                          demo.score >= 800 ? 'bg-green-100 text-green-800' :
                          demo.score >= 740 ? 'bg-blue-100 text-blue-800' :
                          demo.score >= 670 ? 'bg-purple-100 text-purple-800' :
                          demo.score >= 580 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rarity}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">{demo.label}</div>
                      <div className="text-sm font-medium text-gray-800 mb-3">{tier} Credit</div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Loans:</span>
                          <span className="font-medium text-gray-900 ml-1">{demo.loans}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Streak:</span>
                          <span className="font-medium text-gray-900 ml-1">{demo.streak}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Savings:</span>
                          <span className="font-medium text-gray-900 ml-1">{demo.savings.toLocaleString()} STT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Credit Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Credit Achievements</h3>
          <p className="text-sm text-gray-500 mt-1">
            Unlock badges and milestones as you build your credit history
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                title: 'First Loan', 
                description: 'Complete your first loan', 
                achieved: totalLoans > 0,
                icon: '💰',
                requirement: '1+ loans'
              },
              { 
                title: 'Reliable Borrower', 
                description: 'Maintain 5+ payment streak', 
                achieved: (creditProfile ? Number(creditProfile.repaymentStreak) : 0) >= 5,
                icon: '🎯',
                requirement: '5+ streak'
              },
              { 
                title: 'Saver', 
                description: 'Save 1,000+ STT', 
                achieved: (savingsBalance ? Number(formatBalance(savingsBalance)) : 0) >= 1000,
                icon: '🏦',
                requirement: '1,000 STT'
              },
              { 
                title: 'Credit Elite', 
                description: 'Achieve 800+ credit score', 
                achieved: Number(creditScore || 0) >= 800,
                icon: '👑',
                requirement: '800+ score'
              }
            ].map((achievement, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
                achievement.achieved 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl mb-2 ${achievement.achieved ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h4 className={`font-medium text-sm ${
                    achievement.achieved ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    {achievement.description}
                  </p>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    achievement.achieved
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {achievement.achieved ? '✓ Unlocked' : achievement.requirement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NFT Benefits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">NFT Benefits</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your Credit NFT unlocks exclusive benefits based on your score
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { 
                minScore: 800, 
                title: 'Legendary Benefits', 
                benefits: ['20% APY boost', 'Priority support', 'Exclusive events', 'Lower liquidation fees'],
                color: 'green',
                current: Number(creditScore || 0) >= 800
              },
              { 
                minScore: 740, 
                title: 'Epic Benefits', 
                benefits: ['15% APY boost', 'Advanced analytics', 'Beta features', 'Reduced fees'],
                color: 'blue',
                current: Number(creditScore || 0) >= 740 && Number(creditScore || 0) < 800
              },
              { 
                minScore: 670, 
                title: 'Rare Benefits', 
                benefits: ['10% APY boost', 'Extended loan terms', 'Portfolio insights'],
                color: 'purple',
                current: Number(creditScore || 0) >= 670 && Number(creditScore || 0) < 740
              },
              { 
                minScore: 580, 
                title: 'Uncommon Benefits', 
                benefits: ['5% APY boost', 'Basic analytics', 'Standard support'],
                color: 'yellow',
                current: Number(creditScore || 0) >= 580 && Number(creditScore || 0) < 670
              }
            ].map((tier, index) => {
              const getColorClasses = (color: string, current: boolean) => {
                if (!current) return {
                  border: 'border-gray-200 bg-gray-50',
                  title: 'text-gray-600',
                  badge: 'bg-gray-100 text-gray-600'
                }
                
                const colorMap: Record<string, any> = {
                  green: {
                    border: 'border-green-200 bg-green-50',
                    title: 'text-green-800',
                    badge: 'bg-green-100 text-green-700'
                  },
                  blue: {
                    border: 'border-blue-200 bg-blue-50',
                    title: 'text-blue-800',
                    badge: 'bg-blue-100 text-blue-700'
                  },
                  purple: {
                    border: 'border-purple-200 bg-purple-50',
                    title: 'text-purple-800',
                    badge: 'bg-purple-100 text-purple-700'
                  },
                  yellow: {
                    border: 'border-yellow-200 bg-yellow-50',
                    title: 'text-yellow-800',
                    badge: 'bg-yellow-100 text-yellow-700'
                  }
                }
                
                return colorMap[color] || colorMap.green
              }
              
              const colorClasses = getColorClasses(tier.color, tier.current)
              
              return (
              <div key={index} className={`p-4 rounded-lg border-2 ${colorClasses.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`font-semibold ${colorClasses.title}`}>
                        {tier.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${colorClasses.badge}`}>
                        {tier.minScore}+ Score
                      </span>
                      {tier.current && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ✓ Active
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tier.benefits.map((benefit, bidx) => (
                        <div key={bidx} className="flex items-center text-sm">
                          <span className={`mr-2 ${tier.current ? 'text-green-500' : 'text-gray-400'}`}>
                            {tier.current ? '✓' : '○'}
                          </span>
                          <span className={tier.current ? 'text-gray-900' : 'text-gray-500'}>
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
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