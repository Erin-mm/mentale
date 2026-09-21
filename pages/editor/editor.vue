<template>
  <view class="editor-page" @touchstart="handlePageTouchStart" @touchend="handlePageTouchEnd">
    <view class="status-spacer" />
    <view class="editor-bar">
      <text class="note-time">{{ displayTime }}</text>
    </view>
    <view class="paper">
      <input v-model="title" class="title-input" maxlength="80" placeholder="标题" placeholder-class="title-placeholder" @input="markChanged" />
      <view class="paper-line" />
      <textarea v-model="content" class="content-input" maxlength="-1" auto-height placeholder="写在这里……" placeholder-class="content-placeholder" @input="markChanged" />
    </view>
  </view>
</template>

<script>
import { getNote, upsertNote } from '@/common/store.js'

export default {
  data: () => ({
    id: '',
    title: '',
    content: '',
    createdAt: '',
    updatedAt: new Date().toISOString(),
    changed: false,
    autoSaveTimer: null,
    touchStartX: 0,
    touchStartY: 0,
    navigatingBack: false,
  }),
  computed: {
    displayTime() {
      const date = new Date(this.updatedAt || this.createdAt || Date.now())
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}年${month}月${day}日 ${hour}:${minute}`
    },
  },
  onLoad(query) {
    this.id = query.id || ''
    if (this.id) {
      const note = getNote(this.id)
      if (note && !note.deletedAt) {
        this.title = note.title
        this.content = note.content
        this.createdAt = note.createdAt
        this.updatedAt = note.updatedAt || note.createdAt
      }
    }
  },
  onHide() { this.flushSave() },
  onUnload() { this.flushSave() },
  methods: {
    markChanged() {
      this.changed = true
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => this.save(), 500)
    },
    save() {
      if (!this.changed && this.id) return true
      if (!this.title.trim() && !this.content.trim() && !this.id) return false
      const note = upsertNote({ id: this.id, title: this.title, content: this.content, createdAt: this.createdAt })
      this.id = note.id
      this.createdAt = note.createdAt
      this.updatedAt = note.updatedAt
      this.changed = false
      return true
    },
    flushSave() {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = null
      if (this.changed) this.save()
    },
    goBack() {
      if (this.navigatingBack) return
      this.navigatingBack = true
      this.flushSave()
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          fail: () => uni.reLaunch({ url: '/pages/index/index' }),
          complete: () => { this.navigatingBack = false },
        })
        return
      }
      uni.reLaunch({
        url: '/pages/index/index',
        complete: () => { this.navigatingBack = false },
      })
    },
    handlePageTouchStart(event) {
      const point = event.touches && event.touches[0]
      if (!point) return
      this.touchStartX = point.clientX
      this.touchStartY = point.clientY
    },
    handlePageTouchEnd(event) {
      const point = event.changedTouches && event.changedTouches[0]
      if (!point) return
      const deltaX = point.clientX - this.touchStartX
      const deltaY = Math.abs(point.clientY - this.touchStartY)
      if (deltaX > 100 && deltaX > deltaY * 1.5) this.goBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.editor-page { min-height: 100vh; padding: 0 36rpx calc(40rpx + env(safe-area-inset-bottom)); background: $shixin-bg; }
.status-spacer { height: calc(24rpx + var(--status-bar-height)); }
.editor-bar { height: 88rpx; display: flex; align-items: center; justify-content: center; }
.note-time { color: #9a948a; font-size: 25rpx; font-weight: 400; letter-spacing: 1rpx; }
.paper { min-height: 68vh; padding: 18rpx 4rpx 70rpx; }
.title-input { height: 78rpx; color: $shixin-ink; font-size: 38rpx; font-weight: 500; letter-spacing: 2rpx; }
.title-placeholder { color: #c2bbb0; }
.paper-line { width: 72rpx; height: 2rpx; margin: 10rpx 0 32rpx; background: $shixin-coral; opacity: .5; }
.content-input { width: 100%; min-height: 760rpx; color: $shixin-ink; font-size: 34rpx; font-weight: 400; line-height: 2.12; letter-spacing: 1.5rpx; }
.content-placeholder { color: #c2bbb0; }
</style>
