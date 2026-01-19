export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id: string
  title: string
  created_by: string
  created_at: string
  profiles?: Profile
}

export interface Message {
  id: string
  project_id: string
  user_id: string
  content: string | null
  image_url: string | null
  reply_to_id: string | null
  created_at: string
  profiles?: Profile
  reply_to?: Message & { profiles?: Profile }
  reactions?: Reaction[]
}

export interface Reaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
  profiles?: Profile
}

export interface ReactionCount {
  emoji: string
  count: number
  users: { id: string; username: string }[]
  hasReacted: boolean
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Project, 'id' | 'created_by'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Message, 'id' | 'project_id' | 'user_id'>>
      }
      reactions: {
        Row: Reaction
        Insert: Omit<Reaction, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: never
      }
    }
  }
}

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'] as const
export type ReactionEmoji = typeof REACTION_EMOJIS[number]
