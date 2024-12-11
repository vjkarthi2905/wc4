/*
import { createWeb3Modal } from '@web3modal/wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { mainnet, polygon, arbitrum } from 'wagmi/chains'
import { createPublicClient, http } from 'viem'

// IMPORTANT: Get your project ID from https://cloud.walletconnect.com/
const projectId = 'ac1cc01d83f3724fc5b2ba933acbe285'

const metadata = {
  name: 'Telegram Wallet Connect',
  description: 'Wallet Connection for Telegram Mini App',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png']
}

const chains = [mainnet, polygon, arbitrum]
const config = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata 
})

const web3modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains
})

// DOM Elements
const connectBtn = document.getElementById('connectBtn')
const disconnectBtn = document.getElementById('disconnectBtn')
const walletStatus = document.getElementById('walletStatus')

// Telegram WebApp
const tg = window.Telegram.WebApp
tg.ready()
tg.expand()

// Connect Wallet Function
async function connectWallet() {
  try {
    const connection = await web3modal.open()
    const accounts = await connection.getAccounts()
    
    if (accounts.length > 0) {
      const address = accounts[0]
      
      // Fetch balance
      const client = createPublicClient({
        chain: mainnet,
        transport: http()
      })
      const balance = await client.getBalance({ address })
      
      // Update UI
      walletStatus.innerHTML = `
        Connected: ${address}<br>
        Balance: ${balance.toString()} wei
      `
      
      connectBtn.style.display = 'none'
      disconnectBtn.style.display = 'block'
      
      // Telegram feedback
      tg.HapticFeedback.impactOccurred('light')
    }
  } catch (error) {
    console.error('Connection Error:', error)
    walletStatus.textContent = `Connection Failed: ${error.message}`
  }
}

// Disconnect Wallet Function
async function disconnectWallet() {
  try {
    await web3modal.close()
    
    walletStatus.textContent = 'Wallet Disconnected'
    connectBtn.style.display = 'block'
    disconnectBtn.style.display = 'none'
    
    // Telegram feedback
    tg.HapticFeedback.impactOccurred('medium')
  } catch (error) {
    console.error('Disconnection Error:', error)
    walletStatus.textContent = `Disconnection Failed: ${error.message}`
  }
}

// Event Listeners
connectBtn.addEventListener('click', connectWallet)
disconnectBtn.addEventListener('click', disconnectWallet)

*/

import { createWeb3Modal } from '@web3modal/wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { mainnet, polygon, arbitrum } from 'wagmi/chains'

// IMPORTANT: Replace with your WalletConnect Project ID
const projectId = 'ac1cc01d83f3724fc5b2ba933acbe285'

const metadata = {
  name: 'Telegram Wallet Connect',
  description: 'Wallet Connection for Telegram Mini App',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png']
}

const chains = [mainnet, polygon, arbitrum]
const config = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata 
})

const web3modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains
})

// DOM Elements
const connectBtn = document.getElementById('connectBtn')
const disconnectBtn = document.getElementById('disconnectBtn')
const walletStatus = document.getElementById('walletStatus')
const walletAddressDisplay = document.getElementById('walletAddress')

// Telegram WebApp
const tg = window.Telegram.WebApp
tg.ready()
tg.expand()

// Track connection state
let isConnected = false
let walletAddress = null

// Connect Wallet Function
async function connectWallet() {
  try {
    // Open WalletConnect modal
    web3modal.open()

    // Set up event listener for connection
    web3modal.subscribeEvents(async (event) => {
      if (event.type === 'CONNECT') {
        try {
          // Get the connected account
          const account = await config.getAccount()
          
          if (account && account.address) {
            isConnected = true
            walletAddress = account.address

            // Update UI with connection success and wallet address
            updateWalletUI()
            
            // Telegram haptic feedback
            tg.HapticFeedback.impactOccurred('light')
          }
        } catch (accountError) {
          console.error('Account Fetch Error:', accountError)
          updateWalletUI('error', 'Failed to retrieve wallet address')
        }
      }
    })
  } catch (error) {
    console.error('Connection Error:', error)
    updateWalletUI('error', `Connection Failed: ${error.message}`)
  }
}

// Disconnect Wallet Function
async function disconnectWallet() {
  try {
    // Close Web3Modal
    await web3modal.close()
    
    // Clear connection state
    await config.disconnect()
    
    // Reset state
    isConnected = false
    walletAddress = null
    
    // Update UI
    updateWalletUI()
    
    // Telegram haptic feedback
    tg.HapticFeedback.impactOccurred('medium')
  } catch (error) {
    console.error('Disconnection Error:', error)
    updateWalletUI('error', `Disconnection Failed: ${error.message}`)
  }
}

// Update Wallet UI Function
function updateWalletUI(status = 'default', message = '') {
  // Update connection buttons and address display
  if (isConnected && walletAddress) {
    connectBtn.style.display = 'none'
    disconnectBtn.style.display = 'block'
    walletAddressDisplay.textContent = `Wallet: ${walletAddress}`
    walletAddressDisplay.style.display = 'block'
  } else {
    connectBtn.style.display = 'block'
    disconnectBtn.style.display = 'none'
    walletAddressDisplay.textContent = ''
    walletAddressDisplay.style.display = 'none'
  }

  // Update status display
  switch(status) {
    case 'error':
      walletStatus.innerHTML = `
        <div style="color: red; font-weight: bold;">
          ${message}
        </div>
      `
      break
    case 'default':
    default:
      if (isConnected && walletAddress) {
        walletStatus.innerHTML = `
          <div style="color: green; font-weight: bold;">
            Successfully Connected
          </div>
        `
      } else {
        walletStatus.innerHTML = `
          <div style="color: gray;">
            Wallet not connected
          </div>
        `
      }
  }
}

// Initial UI Setup
updateWalletUI()

// Event Listeners
connectBtn.addEventListener('click', connectWallet)
disconnectBtn.addEventListener('click', disconnectWallet)

// Attempt to reconnect on page load
async function initializeConnection() {
  try {
    const account = await config.getAccount()
    
    if (account && account.address) {
      isConnected = true
      walletAddress = account.address
      updateWalletUI()
    }
  } catch (error) {
    console.log('No previous connection found')
    updateWalletUI()
  }
}

// Initialize on page load
initializeConnection()

