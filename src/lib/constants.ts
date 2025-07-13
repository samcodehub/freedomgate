import { SubscriptionPlan, Language } from '@/types'

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'weekly',
    name: 'weekly',
    duration: 'weekly',
    price: 4.99,
    durationInDays: 7,
    features: [
      'highSpeedVPN',
      'unlimitedBandwidth',
      'multipleLocations',
      'basicSupport'
    ]
  },
  {
    id: 'monthly',
    name: 'monthly',
    duration: 'monthly',
    price: 15.99,
    durationInDays: 30,
    popular: true,
    features: [
      'highSpeedVPN',
      'unlimitedBandwidth',
      'multipleLocations',
      'prioritySupport',
      'advancedSecurity'
    ]
  },
  {
    id: 'quarterly',
    name: 'quarterly',
    duration: 'quarterly',
    price: 39.99,
    durationInDays: 90,
    features: [
      'highSpeedVPN',
      'unlimitedBandwidth',
      'multipleLocations',
      'prioritySupport',
      'advancedSecurity',
      'adBlocker'
    ]
  },
  {
    id: 'biannual',
    name: 'biannual',
    duration: 'biannual',
    price: 69.99,
    durationInDays: 180,
    features: [
      'highSpeedVPN',
      'unlimitedBandwidth',
      'multipleLocations',
      'prioritySupport',
      'advancedSecurity',
      'adBlocker',
      'dedicatedIP'
    ]
  },
  {
    id: 'annual',
    name: 'annual',
    duration: 'annual',
    price: 119.99,
    durationInDays: 365,
    features: [
      'highSpeedVPN',
      'unlimitedBandwidth',
      'multipleLocations',
      'prioritySupport',
      'advancedSecurity',
      'adBlocker',
      'dedicatedIP',
      'bestValue'
    ]
  }
]

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fa', name: 'Farsi', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' }
]

export const PAYMENT_METHODS = [
  { id: 'usdt-trc20', name: 'USDT (TRC-20)', network: 'TRON' },
  { id: 'usdt-erc20', name: 'USDT (ERC-20)', network: 'Ethereum' }
]

export const FEATURES = [
  'Military-grade encryption',
  'No-logs policy',
  'Kill switch protection',
  'DNS leak protection',
  'Split tunneling',
  'Multi-device support',
  '24/7 customer support',
  'P2P optimized servers',
  'Streaming servers',
  'Gaming servers'
]

export const COMPANY_INFO = {
  name: 'FreedomGate',
  description: 'Secure VPN and proxy services for ultimate online privacy',
  email: 'support@freedomgate.com',
  website: 'https://freedomgate.com'
}

export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  walletAddress: /^[a-zA-Z0-9]{26,35}$/
} 