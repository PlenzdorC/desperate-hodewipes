/**
 * Battle.net API utilities
 * Documentation: https://develop.battle.net/documentation
 */

const BATTLENET_CLIENT_ID = process.env.BATTLENET_CLIENT_ID || ''
const BATTLENET_CLIENT_SECRET = process.env.BATTLENET_CLIENT_SECRET || ''
const BATTLENET_REDIRECT_URI = process.env.BATTLENET_REDIRECT_URI || 'http://localhost:3000/api/auth/battlenet/callback'
const BATTLENET_REGION = process.env.BATTLENET_REGION || 'eu'

// Battle.net OAuth URLs
const OAUTH_URLS: Record<string, string> = {
  us: 'https://oauth.battle.net',
  eu: 'https://oauth.battle.net',
  kr: 'https://oauth.battle.net',
  tw: 'https://oauth.battle.net',
  cn: 'https://oauth.battlenet.com.cn'
}

// Battle.net API URLs
const API_URLS: Record<string, string> = {
  us: 'https://us.api.blizzard.com',
  eu: 'https://eu.api.blizzard.com',
  kr: 'https://kr.api.blizzard.com',
  tw: 'https://tw.api.blizzard.com',
  cn: 'https://gateway.battlenet.com.cn'
}

export interface BattleNetTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

export interface BattleNetUserInfo {
  id: number
  battletag: string
}

export interface WoWCharacterSummary {
  id: number
  name: string
  realm: {
    name: string
    slug: string
  }
  playable_class: {
    id: number
    name: string
  }
  playable_race: {
    id: number
    name: string
  }
  gender: {
    type: string
    name: string
  }
  faction: {
    type: string
    name: string
  }
  level: number
  last_login_timestamp?: number
}

export interface CharacterProfile {
  id: number
  name: string
  realm: {
    name: string
    slug: string
  }
  faction: {
    type: string
    name: string
  }
  race: {
    id: number
    name: string
  }
  character_class: {
    id: number
    name: string
  }
  active_spec?: {
    id: number
    name: string
  }
  gender: {
    type: string
    name: string
  }
  level: number
  achievement_points: number
  average_item_level: number
  equipped_item_level: number
  last_login_timestamp?: number
  media?: {
    avatar_url: string
    bust_url: string
    render_url: string
  }
}

export interface CharacterEquipment {
  equipped_items: Array<{
    slot: {
      type: string
      name: string
    }
    item: {
      id: number
    }
    name: string
    quality: {
      type: string
      name: string
    }
    level: {
      value: number
      display_string: string
    }
    media?: {
      id: number
    }
    enchantments?: Array<{
      display_string: string
      enchantment_id: number
    }>
    sockets?: Array<{
      item: {
        id: number
        name: string
      }
      display_string: string
    }>
  }>
}

export class BattleNetAPI {
  private region: string
  private clientId: string
  private clientSecret: string

  constructor(region = BATTLENET_REGION) {
    this.region = region
    this.clientId = BATTLENET_CLIENT_ID
    this.clientSecret = BATTLENET_CLIENT_SECRET
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const baseUrl = OAUTH_URLS[this.region]
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: BATTLENET_REDIRECT_URI,
      response_type: 'code',
      scope: 'wow.profile',
      state: state
    })
    return `${baseUrl}/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<BattleNetTokenResponse> {
    const baseUrl = OAUTH_URLS[this.region]
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch(`${baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: BATTLENET_REDIRECT_URI
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get access token: ${error}`)
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<BattleNetTokenResponse> {
    const baseUrl = OAUTH_URLS[this.region]
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch(`${baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh token: ${error}`)
    }

    return response.json()
  }

  /**
   * Get user info (Battle.net ID and BattleTag)
   */
  async getUserInfo(accessToken: string): Promise<BattleNetUserInfo> {
    const baseUrl = OAUTH_URLS[this.region]
    
    const response = await fetch(`${baseUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get user info: ${error}`)
    }

    return response.json()
  }

  /**
   * Get user's WoW characters
   */
  async getWoWCharacters(accessToken: string): Promise<WoWCharacterSummary[]> {
    const baseUrl = API_URLS[this.region]
    
    const response = await fetch(
      `${baseUrl}/profile/user/wow?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get WoW characters: ${error}`)
    }

    const data = await response.json()
    return data.wow_accounts?.flatMap((account: any) => account.characters || []) || []
  }

  /**
   * Get detailed character profile
   */
  async getCharacterProfile(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<CharacterProfile> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get character profile: ${error}`)
    }

    return response.json()
  }

  /**
   * Get character media (avatar, render, etc.)
   */
  async getCharacterMedia(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<any> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/character-media?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  /**
   * Get character equipment
   */
  async getCharacterEquipment(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<CharacterEquipment | null> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/equipment?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  /**
   * Get character mythic+ profile
   */
  async getCharacterMythicKeystoneProfile(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<any> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/mythic-keystone-profile?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  /**
   * Get character raid progression
   */
  async getCharacterRaidProgress(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<any> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/encounters/raids?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  /**
   * Get character PvP bracket statistics
   */
  async getCharacterPvPBracket(
    accessToken: string,
    realmSlug: string,
    characterName: string,
    bracket: '2v2' | '3v3' | 'rbg'
  ): Promise<any> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    const bracketMap = {
      '2v2': 'pvp-bracket-2v2',
      '3v3': 'pvp-bracket-3v3',
      'rbg': 'pvp-bracket-rbg'
    }
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/pvp-bracket/${bracketMap[bracket]}?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  /**
   * Get character PvP summary (all brackets)
   */
  async getCharacterPvPSummary(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<any> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/pvp-summary?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  /**
   * Get character quests (completed)
   */
  async getCharacterQuests(
    accessToken: string,
    realmSlug: string,
    characterName: string
  ): Promise<any> {
    const baseUrl = API_URLS[this.region]
    const encodedName = characterName.toLowerCase()
    
    const response = await fetch(
      `${baseUrl}/profile/wow/character/${realmSlug}/${encodedName}/quests/completed?namespace=profile-${this.region}&locale=de_DE`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  }
}

export const battleNetAPI = new BattleNetAPI()

