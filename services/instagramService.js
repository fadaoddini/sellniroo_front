import axios from 'axios'

// کلاس سرویس اینستاگرام
class InstagramService {
  constructor(accessToken, igUserId) {
    this.accessToken = accessToken
    this.igUserId = igUserId
    this.baseUrl = 'https://graph.facebook.com/v18.0'
  }

  // تنظیم هدرهای درخواست
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    }
  }

  // دریافت اطلاعات کاربر
  async getUserInfo() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.igUserId}`,
        {
          params: {
            fields: 'id,username,name,biography,followers_count,follows_count,media_count',
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw error
    }
  }

  // دریافت لیست پست‌ها
  async getPosts(limit = 20) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.igUserId}/media`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,children{media_url}',
            limit,
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }

  // دریافت جزئیات یک پست خاص
  async getPostDetails(mediaId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${mediaId}`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,children{media_url}',
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching post details:', error)
      throw error
    }
  }

  // دریافت کامنت‌های یک پست
  async getComments(mediaId, limit = 50) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${mediaId}/comments`,
        {
          params: {
            fields: 'id,text,timestamp,like_count,username,replies{id,text,timestamp,username}',
            limit,
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  // پاسخ به کامنت
  async replyToComment(commentId, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${commentId}/replies`,
        {
          message: message,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error replying to comment:', error)
      throw error
    }
  }

  // حذف کامنت
  async deleteComment(commentId) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${commentId}`,
        {
          params: {
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // ایجاد کانتینر برای پست جدید (تصویر)
  async createMediaContainer(imageUrl, caption) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.igUserId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating media container:', error)
      throw error
    }
  }

  // ایجاد کانتینر برای پست ویدیویی
  async createVideoContainer(videoUrl, caption, thumbnailUrl) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.igUserId}/media`,
        {
          media_type: 'VIDEO',
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          caption: caption,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating video container:', error)
      throw error
    }
  }

  // انتشار پست
  async publishMedia(creationId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.igUserId}/media_publish`,
        {
          creation_id: creationId,
          access_token: this.accessToken,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error publishing media:', error)
      throw error
    }
  }

  // حذف پست
  async deleteMedia(mediaId) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${mediaId}`,
        {
          params: {
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error deleting media:', error)
      throw error
    }
  }

  // دریافت استوری‌ها
  async getStories() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.igUserId}/stories`,
        {
          params: {
            fields: 'id,media_type,media_url,permalink,timestamp',
            access_token: this.accessToken,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching stories:', error)
      throw error
    }
  }

  // دریافت آمار پست‌ها
  async getPostStats() {
    try {
      const posts = await this.getPosts(50)
      const media = posts.data || []
      
      const stats = {
        total: media.length,
        images: media.filter(p => p.media_type === 'IMAGE').length,
        videos: media.filter(p => p.media_type === 'VIDEO').length,
        carousels: media.filter(p => p.media_type === 'CAROUSEL_ALBUM').length,
        totalLikes: media.reduce((sum, p) => sum + (p.like_count || 0), 0),
        totalComments: media.reduce((sum, p) => sum + (p.comments_count || 0), 0),
        avgLikes: media.length > 0 ? Math.round(media.reduce((sum, p) => sum + (p.like_count || 0), 0) / media.length) : 0,
        avgComments: media.length > 0 ? Math.round(media.reduce((sum, p) => sum + (p.comments_count || 0), 0) / media.length) : 0,
      }
      
      return stats
    } catch (error) {
      console.error('Error fetching post stats:', error)
      throw error
    }
  }
}

// تابع برای دریافت توکن از localStorage
export const getInstagramToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('instagram_access_token')
  }
  return null
}

// تابع برای ذخیره توکن
export const setInstagramToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('instagram_access_token', token)
  }
}

// تابع برای دریافت ID کاربر
export const getInstagramUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('instagram_user_id')
  }
  return null
}

// تابع برای ذخیره ID کاربر
export const setInstagramUserId = (userId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('instagram_user_id', userId)
  }
}

// ایجاد نمونه سرویس
export const createInstagramService = () => {
  const token = getInstagramToken()
  const userId = getInstagramUserId()
  
  if (!token || !userId) {
    throw new Error('Instagram not connected. Please connect your Instagram account.')
  }
  
  return new InstagramService(token, userId)
}

export default InstagramService
