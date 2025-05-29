<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TabulatorTable from '../components/TabulatorTable.vue'
import DialogTw from '../components/DialogTw.vue'
import ButtonTw from '../components/ButtonTw.vue'
import FormTw from '../components/FormTw.vue'
import icons from '../assets/svg-icons.js'
import es419 from '../assets/es-419.js'

const router = useRouter()

const tablaTabulator = ref(null)
const dialogTw = ref(null)
const dialogTitle = ref('')
const formData = ref({ nombre: '', id: '' })
const editingId = ref(null)
const deleteId = ref(null)

// CAMBIO: Obtener usuario real del localStorage
const usuario = ref(null)

onMounted(() => {
  // Cargar usuario del localStorage
  const usuarioGuardado = localStorage.getItem('usuario')
  if (usuarioGuardado) {
    usuario.value = JSON.parse(usuarioGuardado)
  }
})

const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'id', label: 'ID', type: 'number' }
]

const esAdmin = computed(() => usuario.value?.role === 'admin')
const tabulatorKey = computed(() => `tabla-${esAdmin.value}`)

const editRowButton = () => {
  if (!esAdmin.value) return ''
  return `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800" title="Editar">${icons.edit} Editar</button>`
}

const deleteRowButton = () => {
  if (!esAdmin.value) return ''
  return `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800" title="Eliminar">${icons.delete} Eliminar</button>`
}

const ciudadesRowButton = () => {
  return `<button class="flex items-center gap-1 border-0 bg-transparent text-emerald-600 hover:text-emerald-800" title="Ciudades"> Ciudades</button>`
}

function editRowClick(e, cell) {
  if (!esAdmin.value) return
  const rowData = cell.getRow().getData()
  editingId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Editar departamento'
  dialogTw.value?.popup?.show()
}

function deleteRowClick(e, cell) {
  if (!esAdmin.value) return
  const rowData = cell.getRow().getData()
  deleteId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Eliminar departamento'
  dialogTw.value?.popup?.show()
}

function ciudadesRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  router.push(`/ciudades/${rowData.id}`)
}

const columns = computed(() => {
  const baseCols = [
    { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 100 },
    { title: 'Nombre', field: 'nombre', widthGrow: 1 },
    { formatter: ciudadesRowButton, width: 160, hozAlign: 'center', cellClick: ciudadesRowClick }
  ]

  if (esAdmin.value) {
    baseCols.splice(2, 0,
      { formatter: editRowButton, width: 120, hozAlign: 'center', cellClick: editRowClick },
      { formatter: deleteRowButton, width: 140, hozAlign: 'center', cellClick: deleteRowClick }
    )
  }

  return baseCols
})

function getTabulatorOptions() {
  return {
    locale: 'es-419',
    langs: { 'es-419': es419 },
    pagination: true,
    paginationMode: 'remote',
    ajaxURL: 'http://127.0.0.1:3333/departamentos',
    paginationSize: 5,
    layout: 'fitDataStretch',
    height: '80vh',
    // Agregar esta función para transformar la respuesta
    ajaxResponse: function(url, params, response) {
      // Si tu API devuelve directamente un array de departamentos
      if (Array.isArray(response)) {
        return {
          data: response,
          last_page: Math.ceil(response.length / params.size) || 1,
          current_page: params.page || 1
        };
      }
      // Si tu API ya devuelve un objeto con estructura, solo asegurar que tenga last_page
      return {
        data: response.data || response,
        last_page: response.last_page || response.total_pages || Math.ceil((response.total || response.data?.length || 1) / params.size) || 1,
        current_page: response.current_page || response.page || params.page || 1
      };
    },
    footerElement: esAdmin.value
      ? `<button class="ml-2 rounded px-4 py-1 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-1" id="agregar">${icons.add} Agregar</button>`
      : ''
  }
}

const tabulatorOptions = computed(() => getTabulatorOptions())

function abrirDialogAgregar() {
  if (!esAdmin.value) return
  formData.value = { nombre: '', id: '' }
  editingId.value = null
  deleteId.value = null
  dialogTitle.value = 'Agregar departamento'
  dialogTw.value?.popup?.show()
}

onMounted(() => {
  const table = tablaTabulator.value?.getTable()
  if (!table) return

  function agregarListener() {
    const agregar = document.querySelector('#agregar')
    if (agregar && esAdmin.value) {
      agregar.removeEventListener('click', abrirDialogAgregar)
      agregar.addEventListener('click', abrirDialogAgregar)
    }
  }

  table.on('tableBuilt', agregarListener)
  table.on('dataLoaded', agregarListener)
})

const guardarCambios = async () => {
  if (!esAdmin.value) return

  try {
    const isEdit = !!editingId.value
    const url = isEdit
      ? `http://127.0.0.1:3333/departamentos/${editingId.value}`
      : 'http://127.0.0.1:3333/departamentos'
    const method = isEdit ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    await tablaTabulator.value.getTable().replaceData()
    cerrarDialog()
  } catch (error) {
    console.error('Error al guardar:', error)
  }
}

const eliminarRegistro = async () => {
  if (!esAdmin.value) return

  try {
    const response = await fetch(`http://127.0.0.1:3333/departamentos/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    await tablaTabulator.value.getTable().replaceData()
    cerrarDialog()
  } catch (error) {
    console.error('Error al eliminar:', error)
  }
}

const cerrarDialog = () => {
  dialogTw.value?.popup?.close()
}

const getButtons = () => {
  if (dialogTitle.value === 'Eliminar departamento') {
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
        :key="tabulatorKey"
        :columns="columns"
        :options="tabulatorOptions"
        ref="tablaTabulator"
        class="rounded shadow-md"
      />
    </div>
  </div>

  <!-- CAMBIO: Solo mostrar el dialog si el usuario es admin -->
  <DialogTw
    v-if="esAdmin"
    ref="dialogTw"
    :buttons="buttons"
    :dialog-title="dialogTitle"
    class="p-4"
  >
    <template v-if="dialogTitle !== 'Eliminar departamento'">
      <FormTw
        :form-fields="formFields"
        v-model:form-data="formData"
        @submit.prevent="guardarCambios"
      />
    </template>
    <template v-else>
      <div class="p-4 text-center">
        <p class="text-lg text-red-700 dark:text-red-300">
          ¿Está seguro que desea eliminar el departamento "{{ formData.nombre }}"?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </template>
  </DialogTw>
</template>