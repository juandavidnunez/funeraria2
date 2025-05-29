<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Crea tu cuenta</h2>

      <form @submit.prevent="registrarUsuario">
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-1" for="email">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 font-semibold mb-1" for="password">Contraseña</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Registrarse
        </button>
      </form>

      <p v-if="mensaje" class="mt-4 text-center text-green-600 font-medium">
        {{ mensaje }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const mensaje = ref('')
    const router = useRouter()

    const registrarUsuario = async () => {
      const datos = {
        email: email.value,
        password: password.value,
        role: 'usuario'
      }

      try {
        const respuesta = await fetch('http://localhost:3333/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        })

        if (!respuesta.ok) {
          throw new Error('Error al registrar el usuario')
        }

        mensaje.value = 'Registro exitoso. Redirigiendo al login...'

        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } catch (error) {
        mensaje.value = 'Error: no se pudo registrar. Intenta con otro correo.'
        console.error(error)
      }
    }

    return {
      email,
      password,
      registrarUsuario,
      mensaje
    }
  }
}
</script>
