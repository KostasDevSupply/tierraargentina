import { getActiveAnnouncements } from '@/lib/services/settings.service'
import AnnouncementBarClient from './AnnouncementBarClient'

export default async function AnnouncementBar() {
  const { data: announcements } = await getActiveAnnouncements()

  if (!announcements || announcements.length === 0) return null

  return <AnnouncementBarClient announcements={announcements} />
}