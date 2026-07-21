<script>
export default {
  onLaunch() {
    console.log('拾心已启动')
  },
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  min-height: 100%;
  background: $shixin-bg;
  color: $shixin-text;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

view, text, input, textarea, button {
  box-sizing: border-box;
}

button::after {
  border: 0;
}
</style>
