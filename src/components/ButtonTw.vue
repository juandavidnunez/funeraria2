<script setup>
// import iconos from '../assets/svg-icons'
const props = defineProps(['textContent'])
</script>

<template>
  <button :class="$attrs['mode']" class="inline-flex" @click="$attrs.handleClick">
    <span v-if="$attrs.icon" v-html="iconos[$attrs.icon]" class="-ms-1 h-3 w-5"></span>
    {{ props.textContent }}
  </button>
</template>

<style scoped>
@reference "tailwindcss";

.btn-blue {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-blue-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-blue-300 focus:outline-none dark:shadow-lg dark:shadow-blue-800/80 dark:focus:ring-blue-800;
}
.btn-green {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-green-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-green-300 focus:outline-none dark:shadow-lg dark:shadow-green-800/80 dark:focus:ring-green-800;
}
.btn-cyan {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-cyan-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-cyan-300 focus:outline-none dark:shadow-lg dark:shadow-cyan-800/80 dark:focus:ring-cyan-800;
}
.btn-teal {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-teal-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-teal-300 focus:outline-none dark:shadow-lg dark:shadow-teal-800/80 dark:focus:ring-teal-800;
}
.btn-lime {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 px-5 py-2.5 text-center text-sm font-medium text-gray-900 shadow-lg shadow-lime-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-lime-300 focus:outline-none dark:shadow-lg dark:shadow-lime-800/80 dark:focus:ring-lime-800;
}
.btn-red {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-red-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-red-300 focus:outline-none dark:shadow-lg dark:shadow-red-800/80 dark:focus:ring-red-800;
}
.btn-pink {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-pink-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-pink-300 focus:outline-none dark:shadow-lg dark:shadow-pink-800/80 dark:focus:ring-pink-800;
}
.btn-purple {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-purple-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-purple-300 focus:outline-none dark:shadow-lg dark:shadow-purple-800/80 dark:focus:ring-purple-800;
}
.btn-amber {
  @apply me-2 mb-2 rounded-lg bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg shadow-yellow-500/50 hover:bg-gradient-to-br focus:ring-4 focus:ring-yellow-300 focus:outline-none dark:shadow-lg dark:shadow-yellow-800/80 dark:focus:ring-yellow-800;
}
</style>
