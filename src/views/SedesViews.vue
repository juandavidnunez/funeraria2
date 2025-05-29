<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabulatorTable from '../components/TabulatorTable.vue'
import DialogTw from '../components/DialogTw.vue'
import ButtonTw from '../components/ButtonTw.vue'
import FormTw from '../components/FormTw.vue'
import icons from '../assets/svg-icons.js'
import es419 from '../assets/es-419.js'

const route = useRoute()
const router = useRouter()
const ciudadId = parseInt(route.params.ciudadId)

// Obtener el usuario desde localStorage y definir si es admin
const getUserFromStorage = () => {
  try {
    // Intentar con ambas claves por si hay inconsistencia
    const userStr = localStorage.getItem('user') || localStorage.getItem('usuario')
    const user = userStr ? JSON.parse(userStr) : {}
    console.log('🔍 Usuario desde localStorage:', user)
    console.log('🔍 Rol del usuario:', user?.role)
    
    // Verificar diferentes posibles formatos del rol
    const role = user?.role || user?.user?.role || user?.Role
    const isAdminCheck = 
      role === 'admin' || 
      role === 'Admin' || 
      role === 'ADMIN' ||
      role?.toLowerCase()?.trim() === 'admin'
    
    console.log('🔍 Role encontrado:', role)
    console.log('🔍 Es admin?:', isAdminCheck)
    return { ...user, isAdmin: isAdminCheck }
  } catch (error) {
    console.error('Error al leer usuario desde localStorage:', error)
    return { isAdmin: false }
  }
}

const userData = getUserFromStorage()
const user = userData
const isAdmin = userData.isAdmin

// Para debugging - forzar admin temporalmente (QUITAR EN PRODUCCIÓN)
// const isAdmin = true

const tablaTabulator = ref(null)
const dialogTw = ref(null)
const dialogTitle = ref('')

const sedes = ref([])
const formData = ref({ id: '', nombre: '', direccion: '', telefono: '', correo_electronico: '' })
const editingId = ref(null)
const deleteId = ref(null)

const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'direccion', label: 'Dirección', type: 'text' },
  { id: 'telefono', label: 'Teléfono', type: 'text' },
  { id: 'correo_electronico', label: 'Correo Electrónico', type: 'email' }
]

const sedesFiltradas = computed(() =>
  Array.isArray(sedes.value)
    ? sedes.value.filter(s => s.ciudad_id === ciudadId)
    : []
)

// Función para mostrar/ocultar botón de editar según rol
const editRowButton = () => {
  console.log('🔍 editRowButton - isAdmin:', isAdmin)
  return isAdmin
    ? `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Editar">${icons.edit} Editar</button>`
    : ''
}

// Función para mostrar/ocultar botón de eliminar según rol
const deleteRowButton = () => {
  console.log('🔍 deleteRowButton - isAdmin:', isAdmin)
  return isAdmin
    ? `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Eliminar">${icons.delete} Eliminar</button>`
    : ''
}

// El botón de ir a salas siempre está disponible para todos los usuarios
const irASalasButton = () =>
  `<button class="flex items-center gap-1 border-0 bg-transparent text-emerald-600 hover:text-emerald-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Ver Salas">Salas</button>`

function editRowClick(e, cell) {
  if (!isAdmin) return
  const rowData = cell.getRow().getData()
  editingId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Editar sede'
  dialogTw.value?.popup?.show()
}

function deleteRowClick(e, cell) {
  if (!isAdmin) return
  const rowData = cell.getRow().getData()
  deleteId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Eliminar sede'
  dialogTw.value?.popup?.show()
}

function irASalasClick(e, cell) {
  const rowData = cell.getRow().getData()
  router.push({ path: `/salas/${rowData.id}` })
}

// Columnas condicionadas según el rol del usuario
const columns = computed(() => {
  console.log('🔍 Calculando columns - isAdmin:', isAdmin)
  const baseColumns = [
    { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 80 },
    { title: 'Nombre', field: 'nombre', widthGrow: 1 },
    { title: 'Dirección', field: 'direccion', widthGrow: 1 },
    { title: 'Teléfono', field: 'telefono', widthGrow: 1 },
    { title: 'Correo electrónico', field: 'correo_electronico', widthGrow: 1 },
    { formatter: irASalasButton, width: 120, hozAlign: 'center', cellClick: irASalasClick }
  ]

  // Solo agregar columnas de acciones si es admin
  if (isAdmin) {
    console.log('✅ Agregando columnas de acciones (es admin)')
    baseColumns.push(
      { formatter: editRowButton, width: 120, hozAlign: 'center', cellClick: editRowClick },
      { formatter: deleteRowButton, width: 140, hozAlign: 'center', cellClick: deleteRowClick }
    )
  } else {
    console.log('❌ No agregando columnas de acciones (no es admin)')
  }

  console.log('🔍 Columnas finales:', baseColumns.length)
  return baseColumns
})

// Opciones de Tabulator condicionadas según el rol
const tabulatorOptions = computed(() => {
  console.log('🔍 Calculando tabulatorOptions - isAdmin:', isAdmin)
  const options = {
    locale: 'es-419',
    langs: { 'es-419': es419 },
    pagination: true,
    paginationSize: 5,
    layout: 'fitDataStretch',
    height: '80vh',
    // Solo mostrar botón de agregar si es admin
    footerElement: isAdmin
      ? `<button class="ml-2 rounded-lg px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition duration-200 ease-in-out flex items-center gap-2 shadow-lg hover:shadow-xl" id="agregar">${icons.add} Agregar</button>`
      : ''
  }
  console.log('🔍 FooterElement:', options.footerElement ? 'Con botón' : 'Sin botón')
  return options
})

onMounted(async () => {
  console.log('🚀 Componente montado')
  console.log('🔍 isAdmin al montar:', isAdmin)
  console.log('🔍 Usuario completo:', user)
  
  try {
    const res = await fetch('http://127.0.0.1:3333/sedes')
    const json = await res.json()
    sedes.value = Array.isArray(json) ? json : json.data || []

    const table = tablaTabulator.value?.getTable()
    if (table) {
      table.setData(sedesFiltradas.value)

      // Solo agregar event listener si es admin
      if (isAdmin) {
        console.log('✅ Agregando listener del botón agregar (es admin)')
        setTimeout(() => {
          const agregarButton = document.querySelector('#agregar')
          console.log('🔍 Botón agregar encontrado:', !!agregarButton)
          if (agregarButton) {
            agregarButton.addEventListener('click', () => {
              console.log('🖱️ Click en botón agregar')
              formData.value = { nombre: '', direccion: '', telefono: '', correo_electronico: '' }
              editingId.value = null
              deleteId.value = null
              dialogTitle.value = 'Agregar sede'
              dialogTw.value?.popup?.show()
            })
          }
        }, 100)
      } else {
        console.log('❌ No es admin, no se agrega listener del botón')
      }
    }
  } catch (error) {
    console.error('Error al cargar sedes:', error)
  }
})

const guardarCambios = async () => {
  // Solo permitir si es admin
  if (!isAdmin) {
    alert('No tienes permisos para realizar esta acción.')
    return
  }

  try {
    if (!formData.value.nombre || !formData.value.direccion) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    const isEdit = !!editingId.value
    const url = isEdit
      ? `http://127.0.0.1:3333/sedes/${editingId.value}`
      : 'http://127.0.0.1:3333/sedes'
    const method = isEdit ? 'PUT' : 'POST'

    const body = {
      ...formData.value,
      ciudad_id: ciudadId
    }
    console.log('➡️ Enviando al backend:', JSON.stringify(body, null, 2))

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorJson = await response.json()
      console.error('Error detallado desde backend:', errorJson)
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const res = await fetch('http://127.0.0.1:3333/sedes')
    const json = await res.json()
    sedes.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(sedesFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al guardar sede:', error)
  }
}

const eliminarRegistro = async () => {
  // Solo permitir si es admin
  if (!isAdmin) {
    alert('No tienes permisos para realizar esta acción.')
    return
  }

  try {
    const response = await fetch(`http://127.0.0.1:3333/sedes/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    const res = await fetch('http://127.0.0.1:3333/sedes')
    const json = await res.json()
    sedes.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(sedesFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al eliminar sede:', error)
  }
}

const cerrarDialog = () => {
  dialogTw.value?.popup?.close()
}

const getButtons = () => {
  if (dialogTitle.value === 'Eliminar sede') {
    return [
      {
        id: 'btn-eliminar',
        textContent: 'Eliminar',
        mode: 'btn-red',
        icon: 'delete',
        handleClick: eliminarRegistro
      },
      {
        id: 'btn-cancelar',
        textContent: 'Cancelar',
        mode: 'btn-amber',
        handleClick: cerrarDialog
      }
    ]
  }
  return [
    {
      id: 'btn-guardar',
      textContent: 'Guardar',
      mode: 'btn-cyan',
      icon: 'ok1',
      handleClick: guardarCambios
    },
    {
      id: 'btn-cancelar',
      textContent: 'Cancelar',
      mode: 'btn-amber',
      handleClick: cerrarDialog
    }
  ]
}

const buttons = computed(() => getButtons())
</script>

<template>
  <div class="w-full flex justify-center items-start p-6">
    <div class="w-full max-w-screen-xl">
      <TabulatorTable
        :columns="columns"
        :options="tabulatorOptions"
        ref="tablaTabulator"
        class="rounded-lg border shadow-lg border-gray-300 bg-white"
      />
    </div>
  </div>

  <!-- Solo mostrar el diálogo si es admin -->
  <DialogTw
    v-if="isAdmin"
    ref="dialogTw"
    :buttons="buttons"
    :dialog-title="dialogTitle"
    class="p-4"
  >
    <template v-if="dialogTitle !== 'Eliminar sede'">
      <FormTw
        :form-fields="formFields"
        v-model:form-data="formData"
        @submit.prevent="guardarCambios"
      />
    </template>
    <template v-else>
      <div class="p-4 text-center">
        <p class="text-lg text-red-700 dark:text-red-300">
          ¿Está seguro que desea eliminar la sede "{{ formData.nombre }}"?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </template>
  </DialogTw>
</template>