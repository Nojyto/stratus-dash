export type Note = {
  id: string
  title: string
  content: string | null
  folder_id: string | null
  user_id: string
  created_at: string
}

export type Folder = {
  id: string
  name: string
  parent_id: string | null
  user_id: string
  created_at: string
}

export type DashboardItems = {
  notes: Note[]
  folders: Folder[]
}
