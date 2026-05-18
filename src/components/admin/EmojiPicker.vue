<template>
  <div class="emoji-picker">
    <div class="current" @click="open = !open">{{ modelValue }} <span class="hint">点击换图标</span></div>
    <div v-if="open" class="grid">
      <button v-for="e in options" :key="e" class="emoji-btn"
        :class="{ active: e === modelValue }"
        @click="emit('update:modelValue', e); open = false"
      >{{ e }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
const open = ref(false)
const options = [
  '🎯','🗺️','🛡️','🎧','⭐','🚀','💡','🔑','🌟','🏆',
  '🤝','📱','💎','🔒','🌍','⚡','🎨','📊','🔧','🎁',
  '🏅','🌈','💼','🔔','🎪','🧭','🏙️','🌺','🎶','🛒',
]
</script>

<style scoped>
.emoji-picker { margin-bottom: 6px; }
.current {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 22px; transition: border-color 0.2s;
}
.current:hover { border-color: #36bce5; }
.hint { font-size: 12px; color: #94a3b8; }
.grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px;
  margin-top: 6px; padding: 8px; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 8px;
}
.emoji-btn {
  font-size: 20px; padding: 6px; border: 1px solid transparent;
  border-radius: 6px; background: #fff; cursor: pointer; transition: all 0.15s;
}
.emoji-btn:hover { background: #e0f2fe; border-color: #36bce5; }
.emoji-btn.active { background: #dbeafe; border-color: #1d528d; }
</style>
