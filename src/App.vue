<script setup>
import { ref } from 'vue'

const isSidebarOpen = ref(true)
const departments = [
  { name: 'Servicios Funerarios', icon: '⚰️' },
  { name: 'Cremación', icon: '🔥' },
  { name: 'Obituarios', icon: '📖' },
  { name: 'Flores', icon: '💐' },
  { name: 'Contacto', icon: '📞' }
]
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white">
      <div class="p-4">
        <h1 class="text-2xl font-bold">Funeraria Ganti</h1>
      </div>
      <nav class="mt-4">
        <ul>
          <li v-for="(dept, index) in departments" :key="index"
              class="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors">
            <span class="mr-2">{{ dept.icon }}</span>
            {{ dept.name }}
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 bg-gray-100">
      <header class="bg-white shadow-sm p-4">
        <h2 class="text-xl text-gray-800">Panel Principal</h2>
      </header>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Cards for services -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Servicios Funerarios</h3>
            <p class="text-gray-600">Ofrecemos servicios funerarios completos con dignidad y respeto.</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Cremación</h3>
            <p class="text-gray-600">Servicios de cremación con los más altos estándares.</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Asistencia 24/7</h3>
            <p class="text-gray-600">Estamos disponibles para ayudarte en cualquier momento.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>