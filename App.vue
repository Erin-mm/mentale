<script>
export default {
  onLaunch() {
    console.log('余白已启动')
  },
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  min-height: 100%;
  background: $shixin-bg;
  color: $shixin-text;
  font-family: $shixin-sans;
  font-weight: 400;
  -webkit-font-smoothing: auto;
}

view, text, input, textarea, button {
  box-sizing: border-box;
}

button::after {
  border: 0;
}
</style>
