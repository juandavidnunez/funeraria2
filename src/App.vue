<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const showSidebar = ref(false)
const route = useRoute()
const router = useRouter()

// Cierra el menú si se navega desde un enlace en móvil
const handleNavigation = () => {
  if (window.innerWidth < 768) {
    showSidebar.value = false
  }
}

// Detecta navegación manual también (ej. back/forward)
onMounted(() => {
  router.afterEach(() => {
    handleNavigation()
  })
})
</script>

<template>

  <div class="flex min-h-screen bg-white text-gray-800">
    <!-- Sidebar -->
    <aside
      class="bg-gray-100 shadow-md text-white md:static fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
    
      <nav class="flex-1 mt-6 text-gray-700">
        <ul class="space-y-2">
          <li>
            <RouterLink
              to="/"
              class="block px-6 py-3 hover:bg-blue-200 transition rounded-l-full"
              @click="handleNavigation"
            >
              Inicio
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/departamentos"
              class="block px-6 py-3 hover:bg-blue-200 transition rounded-l-full"
              @click="handleNavigation"
            >
              Departamentos
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-gray-100 shadow-md px-6 py-4 flex items-center justify-between md:justify-start gap-4">
        <!-- Botón menú hamburguesa para móviles -->
        <button
          @click="showSidebar = !showSidebar"
          class="md:hidden text-gray-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Logo e identificación -->
        <div class="flex items-center gap-4">
          <img src="./img/logo.jfif" alt="Logo" class="w-14 h-14 rounded-full border border-gray-300" />
          <h1 class="text-2xl font-bold text-[#1E293B]">Senderos de Luz</h1>
        </div>
      </header>

      <!-- Contenido dinámico -->
      <main class="flex-1 p-6 overflow-y-auto bg-gray-50">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
