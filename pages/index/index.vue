<template>
  <view class="safe-page home">
    <view class="status-spacer" />
    <view class="topbar">
      <view>
        <view class="title-row"><text class="title">余白</text></view>
        <text class="subtitle">留白处，听见自己。</text>
      </view>
      <button class="settings-btn" aria-label="设置" @click="openSettings">
        <image class="settings-icon" src="/static/icons/settings-rounded.svg" mode="aspectFit" />
      </button>
    </view>

    <view class="search-wrap">
      <input v-model="keyword" class="search" placeholder="搜索想法" placeholder-class="placeholder" />
    </view>

    <view v-if="filteredNotes.length" class="note-list">
      <view
        v-for="note in filteredNotes"
        :key="note.id"
        class="note-swipe"
        @touchstart="handleNoteTouchStart($event, note.id)"
        @touchend="handleNoteTouchEnd($event, note.id)"
      >
        <button class="swipe-delete" @click.stop="removeNote(note.id)">删除</button>
        <view :class="['note-card', { 'note-card--open': swipedId === note.id }]" @click="openNote(note.id)">
          <view class="note-main">
            <text class="note-title">{{ note.title || previewTitle(note.content) }}</text>
            <text class="note-content">{{ previewContent(note) }}</text>
          </view>
          <view class="note-meta">
            <text>{{ formatDate(note.updatedAt) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-title">{{ keyword ? '没有找到这一笔' : '此刻，有什么想对自己说的？' }}</text>
      <text class="empty-copy">{{ keyword ? '换一个词，再寻一次' : '写下未说完的话，余下的，交给时间。' }}</text>
    </view>

    <button class="add-button" aria-label="新建想法" @tap="newNote">
      <view class="plus-icon"><view class="plus-line plus-line--horizontal" /><view class="plus-line plus-line--vertical" /></view>
    </button>
  </view>
</template>

<script>
import { deleteNote, loadNotes } from '@/common/store.js'

export default {
  data: () => ({
    notes: [],
    keyword: '',
    swipedId: '',
    touchStartX: 0,
    touchStartY: 0,
    suppressOpen: false,
  }),
  computed: {
    filteredNotes() {
      const word = this.keyword.trim().toLowerCase()
      if (!word) return this.notes
      return this.notes.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(word))
    },
  },
  onReady() {
    // #ifdef APP-PLUS
    plus.navigator.closeSplashscreen()
    // #endif
  },
  onShow() { this.notes = loadNotes(); this.swipedId = '' },
  methods: {
    newNote() { uni.navigateTo({ url: '/pages/editor/editor' }) },
    editNote(id) { uni.navigateTo({ url: `/pages/editor/editor?id=${encodeURIComponent(id)}` }) },
    openNote(id) {
      if (this.suppressOpen) return
      if (this.swipedId) { this.swipedId = ''; return }
      this.editNote(id)
    },
    openSettings() { uni.navigateTo({ url: '/pages/settings/settings' }) },
    handleNoteTouchStart(event) {
      const point = event.touches && event.touches[0]
      if (!point) return
      this.touchStartX = point.clientX
      this.touchStartY = point.clientY
    },
    handleNoteTouchEnd(event, id) {
      const point = event.changedTouches && event.changedTouches[0]
      if (!point) return
      const deltaX = point.clientX - this.touchStartX
      const deltaY = Math.abs(point.clientY - this.touchStartY)
      if (deltaY > Math.abs(deltaX)) return
      if (deltaX < -50) {
        this.swipedId = id
        this.suppressCardOpen()
      } else if (deltaX > 35) {
        this.swipedId = ''
        this.suppressCardOpen()
      }
    },
    suppressCardOpen() {
      this.suppressOpen = true
      setTimeout(() => { this.suppressOpen = false }, 300)
    },
    removeNote(id) {
      deleteNote(id)
      this.notes = loadNotes()
      this.swipedId = ''
      uni.showToast({ title: '已删除', icon: 'none' })
    },
    previewTitle(content) { return String(content || '').trim().split('\n')[0] || '一段小想法' },
    previewContent(note) {
      const content = String(note.content || '').trim().replace(/\s+/g, ' ')
      if (note.title && content) return content
      return content.split(' ').slice(1).join(' ') || '轻轻点开，继续写下去'
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      const today = new Date()
      if (date.toDateString() === today.toDateString()) return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
  },
}
</script>

<style lang="scss" scoped>
.home { position: relative; }
.status-spacer { height: calc(32rpx + var(--status-bar-height)); }
.topbar { display: flex; align-items: flex-start; justify-content: space-between; padding: 34rpx 4rpx 36rpx; }
.title-row { display: flex; align-items: center; gap: 14rpx; }
.title { font-family: $shixin-brand; font-size: 56rpx; font-weight: 500; letter-spacing: 12rpx; color: $shixin-text; }
.subtitle { display: block; color: $shixin-muted; font-size: 24rpx; font-weight: 500; letter-spacing: 3rpx; margin-top: 12rpx; }
.settings-btn { width: 76rpx; height: 76rpx; display: flex; align-items: center; justify-content: center; margin: 8rpx 0 0; padding: 0; border: 1rpx solid rgba(66,62,55,.08); border-radius: 26rpx; background: rgba(252,250,245,.96); color: $shixin-green-dark; box-shadow: 0 10rpx 28rpx rgba(65,58,47,.07); line-height: 1; }
.settings-icon { width: 54rpx; height: 54rpx; display: block; }
.search-wrap { height: 84rpx; display: flex; align-items: center; gap: 12rpx; padding: 0 26rpx; border: 1rpx solid rgba(76,69,59,.08); border-radius: 24rpx; background: rgba(236,231,219,.72); }
.search-icon { color: #858f86; font-size: 40rpx; transform: rotate(-18deg); }
.search { flex: 1; height: 84rpx; color: $shixin-text; font-size: 28rpx; }
.placeholder { color: #aaa397; }
.note-list { padding: 30rpx 0 160rpx; }
.note-swipe { position: relative; margin-bottom: 22rpx; overflow: hidden; border-radius: 28rpx; background: $shixin-coral; }
.swipe-delete { position: absolute; top: 0; right: 0; bottom: 0; width: 142rpx; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0; padding: 0; border-radius: 0; color: #fff; background: $shixin-coral; font-size: 27rpx; font-weight: 600; line-height: 1; }
.note-card { position: relative; z-index: 1; min-height: 210rpx; padding: 34rpx 32rpx 25rpx; border: 1rpx solid rgba(70,64,54,.08); border-radius: 28rpx; background: rgba(252,250,245,.98); transition: transform 220ms ease; }
.note-card--open { transform: translateX(-142rpx); }
.note-main { min-height: 112rpx; }
.note-title { display: block; color: $shixin-text; font-size: 32rpx; font-weight: 500; line-height: 1.55; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.note-content { display: -webkit-box; margin-top: 12rpx; overflow: hidden; color: #7a756c; font-size: 27rpx; font-weight: 400; line-height: 1.75; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.note-meta { display: flex; align-items: center; gap: 10rpx; padding-top: 20rpx; color: #a39b90; font-size: 22rpx; border-top: 1rpx solid $shixin-line; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 150rpx 48rpx 0; text-align: center; }
.empty-mark { width: 130rpx; height: 130rpx; display: grid; place-items: center; border-radius: 44rpx; color: $shixin-coral; background: linear-gradient(145deg, #fff, #edf2ee); box-shadow: 0 20rpx 50rpx rgba(79,88,72,.09); font-size: 64rpx; }
.empty-title { margin-top: 42rpx; font-size: 30rpx; font-weight: 500; letter-spacing: 2rpx; }
.empty-copy { max-width: 480rpx; margin-top: 16rpx; color: $shixin-muted; font-size: 25rpx; font-weight: 400; line-height: 1.85; }
.add-button { position: fixed; z-index: 9999; right: 42rpx; bottom: calc(42rpx + env(safe-area-inset-bottom)); width: 112rpx; height: 112rpx; display: flex; align-items: center; justify-content: center; margin: 0; padding: 0; border: 2rpx solid rgba(255,255,255,.72); border-radius: 50%; background: $shixin-coral; box-shadow: 0 18rpx 42rpx rgba(126,62,39,.26); transform: translateZ(0); }
.plus-icon { position: relative; width: 42rpx; height: 42rpx; }
.plus-line { position: absolute; top: 50%; left: 50%; border-radius: 999rpx; background: rgba(255,255,255,.96); transform: translate(-50%, -50%); }
.plus-line--horizontal { width: 42rpx; height: 7rpx; }
.plus-line--vertical { width: 7rpx; height: 42rpx; }
</style>
