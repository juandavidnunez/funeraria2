<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import TabulatorTable from '../components/TabulatorTable.vue'
import DialogTw from '../components/DialogTw.vue'
import FormTw from '../components/FormTw.vue'
import icons from '../assets/svg-icons.js'
import es419 from '../assets/es-419.js'

const route = useRoute()
const sedeId = parseInt(route.params.sedeId)

// Obtener el usuario desde localStorage y definir si es admin
const getUserFromStorage = () => {
  try {
    // Intentar con ambas claves por si hay inconsistencia
    const userStr = localStorage.getItem('user') || localStorage.getItem('usuario')
    const user = userStr ? JSON.parse(userStr) : {}
    
    // Verificar diferentes posibles formatos del rol
    const role = user?.role || user?.user?.role || user?.Role
    const isAdminCheck = 
      role === 'admin' || 
      role === 'Admin' || 
      role === 'ADMIN' ||
      role?.toLowerCase()?.trim() === 'admin'
    
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

const salas = ref([])
const formData = ref({ id: '', nombre: '', capacidad: '', disponibilidad: false })
const editingId = ref(null)
const deleteId = ref(null)

const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'capacidad', label: 'Capacidad', type: 'number' },
  { id: 'disponibilidad', label: '¿Disponible?', type: 'checkbox' }
]

const salasFiltradas = computed(() =>
  Array.isArray(salas.value)
    ? salas.value.filter(s => s.sedes_id === sedeId)
    : []
)

// Función para mostrar/ocultar botón de editar según rol
const editRowButton = () => {
  return isAdmin
    ? `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Editar">${icons.edit} Editar</button>`
    : ''
}

// Función para mostrar/ocultar botón de eliminar según rol
const deleteRowButton = () => {
  return isAdmin
    ? `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Eliminar">${icons.delete} Eliminar</button>`
    : ''
}

function editRowClick(e, cell) {
  if (!isAdmin) return
  const rowData = cell.getRow().getData()
  editingId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Editar sala'
  dialogTw.value?.popup?.show()
}

function deleteRowClick(e, cell) {
  if (!isAdmin) return
  const rowData = cell.getRow().getData()
  deleteId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Eliminar sala'
  dialogTw.value?.popup?.show()
}

// Columnas condicionadas según el rol del usuario
const columns = computed(() => {
  const baseColumns = [
    { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 80 },
    { title: 'Nombre', field: 'nombre', widthGrow: 1 },
    { title: 'Capacidad', field: 'capacidad', hozAlign: 'center' },
    { title: 'Disponibilidad', field: 'disponibilidad', formatter: 'tickCross', hozAlign: 'center' }
  ]

  // Solo agregar columnas de acciones si es admin
  if (isAdmin) {
    baseColumns.push(
      { formatter: editRowButton, width: 120, hozAlign: 'center', cellClick: editRowClick },
      { formatter: deleteRowButton, width: 140, hozAlign: 'center', cellClick: deleteRowClick }
    )
  }

  return baseColumns
})

// Opciones de Tabulator condicionadas según el rol
const tabulatorOptions = computed(() => {
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
  return options
})

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3333/salas')
    const json = await res.json()
    salas.value = (Array.isArray(json) ? json : json.data || []).map(sala => ({
  ...sala,
  disponibilidad: sala.disponibilidad === true || sala.disponibilidad === 1 || sala.disponibilidad === 'true'
}))


    const table = tablaTabulator.value?.getTable()
    if (table) {
      table.setData(salasFiltradas.value)

      // Solo agregar event listener si es admin
      if (isAdmin) {
        setTimeout(() => {
          const agregarButton = document.querySelector('#agregar')
          if (agregarButton) {
            agregarButton.addEventListener('click', () => {
              formData.value = { nombre: '', capacidad: '', disponibilidad: false }
              editingId.value = null
              deleteId.value = null
              dialogTitle.value = 'Agregar sala'
              dialogTw.value?.popup?.show()
            })
          }
        }, 100)
      } 
    }
  } catch (error) {
    console.error('Error al cargar salas:', error)
  }
})

const guardarCambios = async () => {
  // Solo permitir si es admin
  if (!isAdmin) {
    alert('No tienes permisos para realizar esta acción.')
    return
  }

  try {
    if (!formData.value.nombre || !formData.value.capacidad) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    const isEdit = !!editingId.value
    const url = isEdit
      ? `http://127.0.0.1:3333/salas/${editingId.value}`
      : 'http://127.0.0.1:3333/salas'
    const method = isEdit ? 'PUT' : 'POST'

const body = {
  ...formData.value,
  disponibilidad: !!formData.value.disponibilidad, // fuerza valor booleano
  sedes_id: sedeId
}



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

    const res = await fetch('http://127.0.0.1:3333/salas')
    const json = await res.json()
    salas.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(salasFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al guardar sala:', error)
  }
}

const eliminarRegistro = async () => {
  // Solo permitir si es admin
  if (!isAdmin) {
    alert('No tienes permisos para realizar esta acción.')
    return
  }

  try {
    const response = await fetch(`http://127.0.0.1:3333/salas/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    const res = await fetch('http://127.0.0.1:3333/salas')
    const json = await res.json()
    salas.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(salasFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al eliminar sala:', error)
  }
}

const cerrarDialog = () => {
  dialogTw.value?.popup?.close()
}

const getButtons = () => {
  if (dialogTitle.value === 'Eliminar sala') {
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
    <template v-if="dialogTitle !== 'Eliminar sala'">
      <FormTw
        :form-fields="formFields"
        v-model:form-data="formData"
        @submit.prevent="guardarCambios"
      />
    </template>
    <template v-else>
      <div class="p-4 text-center">
        <p class="text-lg text-red-700 dark:text-red-300">
          ¿Está seguro que desea eliminar la sala "{{ formData.nombre }}"?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </template>
  </DialogTw>
</template>