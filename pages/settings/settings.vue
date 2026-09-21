<template>
  <view class="settings-page" @touchstart="handlePageTouchStart" @touchend="handlePageTouchEnd">
    <view class="status-spacer" />
    <view class="header">
      <view class="header-copy"><text class="title">设置</text><text class="subtitle">让每一笔，都有归处</text></view>
    </view>

    <view class="section-title">GITHUB 同步</view>
    <view class="settings-card soft-card">
      <view class="switch-row">
        <view><text class="row-title">开启同步</text><text class="row-desc">点击下方按钮时，与私有仓库双向合并</text></view>
        <switch :checked="form.enabled" color="#a95736" @change="form.enabled = $event.detail.value; persist()" />
      </view>
      <view class="divider" />
      <label class="field"><text>GitHub 用户名</text><input v-model="form.owner" placeholder="例如 erin-mm" @blur="persist" /></label>
      <label class="field"><text>仓库名</text><input v-model="form.repo" placeholder="例如 shixin-data（建议私有）" @blur="persist" /></label>
      <view class="field-grid">
        <label class="field"><text>分支</text><input v-model="form.branch" placeholder="main" @blur="persist" /></label>
        <label class="field"><text>目录</text><input v-model="form.basePath" placeholder="shixin-data" @blur="persist" /></label>
      </view>
      <label class="field token-field">
        <text>Fine-grained token</text>
        <view class="token-input"><input v-model="form.token" :password="!showToken" placeholder="github_pat_..." @blur="persist" /><text @click="showToken = !showToken">{{ showToken ? '隐藏' : '显示' }}</text></view>
      </label>
      <text class="security-note">Token 只保存在这台设备本地。建议仅授权目标仓库的 Contents 读写权限。</text>
    </view>

    <button class="sync-btn" :loading="syncing" :disabled="syncing" @click="syncNow">
      {{ syncing ? '正在收拢散落的字句…' : '立即同步' }}
    </button>
    <view v-if="status" :class="['status', statusType]"><text>{{ status }}</text></view>
    <text v-if="form.lastSyncedAt" class="last-sync">上次同步：{{ formatTime(form.lastSyncedAt) }}</text>
  </view>
</template>

<script>
import { loadSettings, saveSettings } from '@/common/store.js'
import { syncWithGitHub } from '@/common/github.js'

export default {
  data: () => ({
    form: loadSettings(),
    showToken: false,
    syncing: false,
    status: '',
    statusType: '',
    touchStartX: 0,
    touchStartY: 0,
    navigatingBack: false,
  }),
  onHide() { this.persist() },
  onUnload() { this.persist() },
  methods: {
    persist() { this.form = saveSettings(this.form) },
    back() {
      if (this.navigatingBack) return
      this.navigatingBack = true
      this.persist()
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
      if (deltaX > 100 && deltaX > deltaY * 1.5) this.back()
    },
    async syncNow() {
      this.persist()
      this.syncing = true
      this.status = ''
      try {
        const result = await syncWithGitHub(this.form)
        this.form = result.settings
        this.status = `同步完成，共收好 ${result.notes.filter((note) => !note.deletedAt).length} 篇独白`
        this.statusType = 'success'
      } catch (error) {
        this.status = error.message || '同步失败，请检查网络和配置'
        this.statusType = 'error'
      } finally { this.syncing = false }
    },
    formatTime(value) { return new Date(value).toLocaleString() },
  },
}
</script>

<style lang="scss" scoped>
.settings-page { min-height: 100vh; padding: 0 30rpx calc(56rpx + env(safe-area-inset-bottom)); }
.status-spacer { height: calc(24rpx + var(--status-bar-height)); }
.header { display: flex; align-items: center; padding: 22rpx 0 46rpx; }
.header-copy { display: flex; flex-direction: column; }
.title { font-size: 42rpx; font-weight: 500; letter-spacing: 6rpx; }
.subtitle { margin-top: 5rpx; color: $shixin-muted; font-size: 23rpx; }
.section-title { margin: 0 12rpx 16rpx; color: $shixin-green; font-size: 21rpx; font-weight: 500; letter-spacing: 4rpx; }
.settings-card { padding: 12rpx 30rpx 32rpx; border-radius: 34rpx; }
.switch-row { min-height: 118rpx; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.row-title, .row-desc { display: block; }
.row-title { color: $shixin-text; font-size: 29rpx; font-weight: 500; }
.row-desc { margin-top: 8rpx; color: $shixin-muted; font-size: 22rpx; line-height: 1.5; }
.divider { height: 1rpx; background: $shixin-line; }
.field { display: flex; flex-direction: column; gap: 12rpx; margin-top: 28rpx; color: #777065; font-size: 22rpx; font-weight: 600; }
.field input { height: 82rpx; padding: 0 22rpx; border-radius: 22rpx; color: $shixin-text; background: #f1ede4; font-size: 27rpx; font-weight: 400; }
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18rpx; }
.token-input { height: 82rpx; display: flex; align-items: center; padding-right: 22rpx; border-radius: 22rpx; background: #f1ede4; }
.token-input input { flex: 1; background: transparent; }
.token-input text { color: $shixin-green-dark; font-size: 23rpx; }
.security-note { display: block; margin-top: 20rpx; color: #9b9388; font-size: 21rpx; line-height: 1.6; }
.sync-btn { height: 94rpx; margin: 28rpx 0 0; border-radius: 29rpx; color: #fff; background: $shixin-coral; box-shadow: 0 16rpx 38rpx rgba(126,62,39,.2); font-size: 29rpx; font-weight: 650; line-height: 94rpx; }
.sync-btn[disabled] { opacity: .72; }
.status { margin-top: 20rpx; padding: 20rpx 24rpx; border-radius: 20rpx; font-size: 23rpx; line-height: 1.5; }
.status.success { color: #625b50; background: #ece6d9; }
.status.error { color: #9b4d34; background: #f7e6dd; }
.last-sync { display: block; margin-top: 16rpx; color: #9d958a; text-align: center; font-size: 21rpx; }
</style>
