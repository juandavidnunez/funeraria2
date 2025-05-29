<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const correo = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  try {
    const { data } = await axios.get('http://localhost:3333/usuarios');
    console.log('Respuesta del backend:', data);

    const usuarios = Array.isArray(data.data) ? data.data : [];

    const usuarioEncontrado = usuarios.find(
      (u) => u.email === correo.value && u.password === password.value
    );

    if (usuarioEncontrado) {
      localStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));
      
      // Redirigir y recargar la página
      router.push('/');
      setTimeout(() => window.location.reload(), 100);
    } else {
      error.value = 'Correo o contraseña incorrectos';
    }
  } catch (err) {
    console.error('Error en login:', err);
    error.value = 'Error al conectar con el servidor';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
    <div class="bg-white shadow-xl rounded-2xl p-8 max-w-sm w-full space-y-6">
      <h2 class="text-2xl font-bold text-center text-indigo-700">Iniciar sesión</h2>

      <div class="space-y-4">
        <div>
          <label for="correo" class="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            id="correo"
            v-model="correo"
            placeholder="ejemplo@email.com"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="********"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div v-if="error" class="text-sm text-red-600 font-semibold text-center">
          {{ error }}
        </div>

        <button
          @click="login"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold transition"
        >
          Entrar
        </button>
      </div>
    </div>
  </div>
</template>