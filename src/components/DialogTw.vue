<script setup>
 import iconos from '../assets/svg-icons.js'
 import ButtonTw from './ButtonTw.vue'
import { ref } from 'vue'

const popup = ref(null)

defineExpose({
  popup,
})

const props = defineProps({
  dialogTitle: String,
  buttons: {
    type: Array,
    required: true, // Indica que el prop es obligatorio
  },
  handleClick: Function,
})
</script>

<template>
  <dialog ref="popup">
    <header>
      <!-- igual que en la versión anterior -->
      <h3>{{ dialogTitle ?? 'Sin título' }}</h3>
      <button type="button">
        <span v-html="iconos.closeButton1"></span>
      </button>
    </header>

    <div class="content">
      <slot></slot>
    </div>

    <footer v-if="buttons.length">
      <ButtonTw v-for="b in buttons" :text-content="b.textContent" :mode="b.mode" :icon="b.icon" :handleClick="b.handleClick" />
    </footer>
  </dialog>
</template>

<style scoped>
@reference "tailwindcss";
dialog {
  @apply fixed inset-0 m-6 mx-auto w-1/2 rounded bg-gray-900 p-4 text-white shadow-lg shadow-cyan-500/50 backdrop-opacity-70;
}

dialog > header {
  @apply flex items-center justify-between rounded-t border-b border-gray-700 pb-4;
}

dialog > header > h3 {
  @apply text-xl font-semibold text-white;
}

dialog > header > button {
  @apply ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-800 hover:text-white;
}

dialog .content {
  @apply flex flex-col w-full p-4 text-left;
}

dialog > footer {
  @apply flex justify-end rounded-b border-t border-gray-700 pt-4;
}
</style>
