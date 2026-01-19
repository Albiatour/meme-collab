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
  created_at: string
  profiles?: Profile
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
    }
  }
}
