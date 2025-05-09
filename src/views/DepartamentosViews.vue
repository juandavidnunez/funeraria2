<script setup>
import { ref, onMounted, computed } from 'vue'
import TabulatorTable from './components/TabulatorTable.vue'
import DialogTw from './components/DialogTw.vue'
import ButtonTw from './components/ButtonTw.vue'
import icons from './assets/svg-icons.js'
import es419 from './assets/es-419.js'
import FormTw from './components/FormTw.vue'

const editRowButton = () => `<button id="edit-row" class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800" title="Editar">${icons.edit} Editar</button>`
const deleteRowButton = () => `<button id="delete-row" class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800" title="Eliminar">${icons.delete} Eliminar</button>`

const columns = ref([
  { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 100 },
  { title: 'Nombre', field: 'nombre', hozAlign: 'left', widthGrow: 1 },
  { formatter: editRowButton, width: 120, hozAlign: 'center', cellClick: editRowClick },
  { formatter: deleteRowButton, width: 140, hozAlign: 'center', cellClick: deleteRowClick }
])

const tabulatorOptions = ref({
  locale: true,
  langs: { 'es-419': es419 },
  pagination: true,
  paginationMode: 'remote',
  ajaxURL: 'http://127.0.0.1:3333/departamentos',
  paginationSize: 5,
  layout: 'fitDataStretch', // Mejora la adaptación al ancho
  height: '80vh', // Ocupa gran parte de la pantalla
  footerElement: `<button class="ml-2 rounded px-4 py-1 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-1" id="agregar">${icons.add} Agregar</button>`
})

const tablaTabulator = ref(null)
let table = null

onMounted(() => {
  table = tablaTabulator.value.getTable()
  table.on('tableBuilt', () => {
    const agregar = document.querySelector('#agregar')
    if (agregar) {
      agregar.addEventListener('click', () => {
        formData.value = { nombre: '', id: '' }
        editingId.value = null
        deleteId.value = null
        dialogTitle.value = 'Agregar departamento'
        dialogTw.value?.popup?.show()
      })
    }
  })
})

const formData = ref({ nombre: '', id: '' })
const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'id', label: 'ID', type: 'number' }
]

const editingId = ref(null)
const deleteId = ref(null)

function editRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  editingId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Editar departamento'
  dialogTw.value?.popup?.show()
}

function deleteRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  deleteId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Eliminar departamento'
  dialogTw.value?.popup?.show()
}

const guardarCambios = async () => {
  try {
    let response
    const url = editingId.value
      ? `http://127.0.0.1:3333/departamentos/${editingId.value}`
      : 'http://127.0.0.1:3333/departamentos'

    const method = editingId.value ? 'PUT' : 'POST'

    response = await fetch(url, {
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
const dialogTw = ref(null)
const dialogTitle = ref(null)
</script>

<template>
  <div class="w-full flex justify-center items-start p-6">
    <div class="w-full max-w-screen-xl">
      <TabulatorTable
        :columns="columns"
        :options="tabulatorOptions"
        ref="tablaTabulator"
        class="rounded shadow-md"
      />
    </div>
  </div>

  <DialogTw
    ref="dialogTw"
    :buttons="buttons"
    :dialog-title="dialogTitle"
    class="p-4"
  >
    <template v-if="dialogTitle !== 'Eliminar departamento'">
      <FormTw
        :form-fields="formFields"
        v-model:form-data="formData"
        @submit="guardarCambios"
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
