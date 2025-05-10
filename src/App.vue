<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Encabezado -->
    <header class="bg-gray-900 text-white p-4">
      <h1 class="text-2xl font-bold">Funeraria</h1>
    </header>

    <div class="flex flex-1">
      <!-- Barra lateral -->
      <aside class="w-64 bg-gray-800 text-white">
        <nav class="mt-4">
          <ul>
            <li class="px-4 py-3 hover:bg-gray-700 transition-colors">
              <RouterLink to="/" class="block w-full">Inicio</RouterLink>
            </li>
            <li class="px-4 py-3 hover:bg-gray-700 transition-colors">
              <RouterLink to="/departamentos" class="block w-full">Departamentos</RouterLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1 p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind cubre la mayoría de los estilos */
</style>
