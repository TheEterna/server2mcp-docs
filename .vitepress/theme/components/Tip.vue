<template>
  <div class="vp-tip">
    <slot />
  </div>
</template>

<style scoped>
.vp-tip {
  border-left: 4px solid var(--vp-c-brand-1);
  background: rgba(50, 182, 122, 0.06);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}
</style> 