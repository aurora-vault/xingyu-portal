<template>
  <div class="field" :class="{ compact }">
    <label class="field-label">{{ label }}</label>
    <textarea v-if="type === 'textarea'" class="field-input field-textarea"
      :value="modelValue" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      rows="3"
    />
    <input v-else class="field-input"
      :value="modelValue" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: string; type?: string; compact?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<style scoped>
.field { margin-bottom: 12px; }
.field.compact { margin-bottom: 6px; }
.field-label { display: block; font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
.field-input {
  width: 100%; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; color: #0f172a; background: #fff; outline: none;
  transition: border-color 0.2s; box-sizing: border-box; font-family: inherit;
}
.field-input:focus { border-color: #36bce5; }
.field-textarea { resize: vertical; min-height: 72px; }
</style>
