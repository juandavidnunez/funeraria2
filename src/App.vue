<script setup>
import { ref } from 'vue'

const isSidebarOpen = ref(true)
const departments = [
  { name: 'Inicio', icon: '🏠' },
  { name: 'Servicios Funerarios', icon: '⚰️' },
  { name: 'Cremación', icon: '🔥' },
  { name: 'Obituarios', icon: '📖' },
  { name: 'Flores', icon: '💐' },
  { name: 'Contacto', icon: '📞' },
  { name: 'Login', icon: '🔐' },
]
</script>

<template>
  <div class="min-h-screen flex bg-gray-100 font-serif">
    <!-- Sidebar -->
    <aside class="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg">
      <div class="p-6">
        <h1 class="text-3xl font-bold text-white tracking-wide">Funeraria Ganti</h1>
        <p class="mt-1 text-sm text-gray-400">"Honrando la vida, acompañando en la partida."</p>
      </div>
      <nav class="mt-6">
        <ul>
          <li v-for="(dept, index) in departments" :key="index"
              class="px-6 py-3 hover:bg-gray-700 cursor-pointer flex items-center transition-all rounded">
            <span class="mr-3 text-xl">{{ dept.icon }}</span>
            <span class="text-md font-medium">{{ dept.name }}</span>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 bg-gray-50">
      <!-- Header -->
      <header class="mb-8">
        <h2 class="text-3xl font-semibold text-gray-800">Bienvenidos a Funeraria Ganti</h2>
      </header>

      <!-- Misión y Visión -->
      <section class="bg-white p-8 rounded-lg shadow-md border-l-4 border-purple-500">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Nuestra Misión</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          Brindar apoyo integral, servicios dignos y personalizados para acompañar a las familias en los momentos más delicados,
          con respeto, empatía y excelencia.
        </p>

        <h3 class="text-2xl font-bold text-gray-800 mb-4">Nuestra Visión</h3>
        <p class="text-gray-700 leading-relaxed">
          Ser la funeraria de mayor confianza y referencia en la comunidad, innovando en servicios humanos y tecnológicos para
          honrar la vida con amor y respeto.
        </p>
      </section>

      <!-- Servicios -->
      <section class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
          <h4 class="text-xl font-semibold text-gray-800 mb-2">⚰️ Servicios Funerarios</h4>
          <p class="text-gray-600">Ceremonias personalizadas con respeto, tradición y calidez humana.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
          <h4 class="text-xl font-semibold text-gray-800 mb-2">🔥 Cremación</h4>
          <p class="text-gray-600">Procesos éticos y cuidadosos en ambientes serenos.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
          <h4 class="text-xl font-semibold text-gray-800 mb-2">💐 Flores</h4>
          <p class="text-gray-600">Arreglos florales que transmiten amor y consuelo.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
