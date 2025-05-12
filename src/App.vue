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
  <div class="min-h-screen flex">
    <!-- Header fijo -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-4 z-50 flex items-center justify-between">
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
      <div class="flex items-center gap-4">
        <img src="../src/img/logoS.jpg" alt="Logo" class="h-14 w-14 rounded-full" />
        <h1 class="text-2xl font-bold text-gray-800">Senderos de Luz</h1>
      </div>
    </header>

    <!-- Sidebar fijo -->
    <aside
      class="fixed top-[4.5rem] left-0 h-[calc(100vh-4.5rem)] bg-gray-100 shadow-md w-64 transform transition-transform duration-300 ease-in-out overflow-y-auto z-40"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <nav class="flex-1 py-6 text-gray-700">
        <ul class="space-y-2">
          <li>
            <RouterLink
              to="/"
              class=" px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="handleNavigation"
            >
              <img class="w-4" ref="icon" src="./img/image.png" alt="">
              Inicio
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/departamentos"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="handleNavigation"
            >
            <img  ref="icon" src="./img/colombia.png" alt="">
              Departamentos
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/cremacion"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="handleNavigation"
            >
            <img  ref="icon" src="./img/urna-de-cremacion.png" alt="">
              Servicio de Cremacion
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/traslado"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="handleNavigation"
            >
              <img  ref="icon" src="./img/coche-funebre.png" alt="">
              Traslado
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/sepultura"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="handleNavigation"
            >
              <img  ref="icon" src="./img/sepultura.png" alt="">
              Sepultura
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <div class="flex-1 md:ml-64 pt-[4.5rem]">
      <main class="min-h-screen p-6 bg-gray-50 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para el scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

/* Prevenir scroll del body */
:root {
  overflow: hidden;
}
</style>
