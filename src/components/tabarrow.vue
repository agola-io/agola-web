<template>
  <div class="arrow">
    <svg viewBox="0 0 15 15">
      <path
        fill="none"
        stroke="#9d9d9d"
        d="M4.32.5l6.247 6.942L4.32 14.5"
      ></path>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'tabarrow',
};
</script>

<style scoped lang="scss">
.arrow {
  width: 1.2em;
  height: 1.4em;
  align-items: center;
  position: relative;
  top: 0.1rem;
}
</style>
