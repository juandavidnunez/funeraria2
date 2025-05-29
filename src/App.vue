<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const showSidebar = ref(false)
const route = useRoute()
const router = useRouter()
const usuario = ref(null)

onMounted(() => {
  // Usar la misma clave 'user' para consistencia
  const usuarioGuardado = localStorage.getItem('user') || localStorage.getItem('usuario')
  if (usuarioGuardado) {
    usuario.value = JSON.parse(usuarioGuardado)
  }

  // Cierra menú en móvil al navegar
  router.afterEach(() => {
    if (window.innerWidth < 768) {
      showSidebar.value = false
    }
  })
})

const cerrarSesion = () => {
  // Limpiar ambas claves por si acaso
  localStorage.removeItem('user')
  localStorage.removeItem('usuario')
  usuario.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Header fijo -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-4 z-50 flex items-center justify-between">
      <div class="flex items-center gap-4">
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
        <img src="../src/img/logoS.jpg" alt="Logo" class="h-14 w-14 rounded-full" />
        <h1 class="text-2xl font-bold text-gray-800">Senderos de Luz</h1>
      </div>

      <!-- Usuario + Logout -->
      <div v-if="usuario" class="flex items-center gap-4">
        <span class="text-sm text-gray-700 font-medium">
          {{ usuario.email }} 
          <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs ml-2">
            {{ usuario.role }}
          </span>
        </span>
        <button
          @click="cerrarSesion"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

    <!-- Sidebar -->
    <aside
      class="fixed top-[4.5rem] left-0 h-[calc(100vh-4.5rem)] bg-gray-100 shadow-md w-64 transform transition-transform duration-300 ease-in-out overflow-y-auto z-40"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <nav class="flex-1 py-6 text-gray-700">
        <ul class="space-y-2">
          <li v-if="!usuario">
            <RouterLink
              to="/login"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img src="./img/cuenta.png" alt="icono">
              Login
            </RouterLink>
          </li>
          <li v-if="!usuario">
            <RouterLink
              to="/registrate"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img src="./img/verificar.png" alt="icono">
              Regístrate
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img class="w-4" src="./img/image.png" alt="icono">
              Inicio
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/departamentos"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img src="./img/colombia.png" alt="icono">
              Departamentos
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/cremacion"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img src="./img/urna-de-cremacion.png" alt="icono">
              Servicio de Cremación
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/traslado"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img src="./img/coche-funebre.png" alt="icono">
              Traslado
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/sepultura"
              class="px-6 py-3 hover:bg-blue-200 transition rounded-l-full flex items-center gap-2"
              @click="showSidebar = false"
            >
              <img src="./img/sepultura.png" alt="icono">
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
:root {
  overflow: hidden;
}
</style>