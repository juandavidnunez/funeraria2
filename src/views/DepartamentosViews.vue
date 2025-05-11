<script setup>
import { ref, onMounted, computed } from 'vue'
import TabulatorTable from '../components/TabulatorTable.vue'
import DialogTw from '../components/DialogTw.vue'
import FormTw from '../components/FormTw.vue'
import icons from '../assets/svg-icons.js'
import es419 from '../assets/es-419.js'

const tablaTabulator = ref(null)
const dialogTw = ref(null)
const dialogTitle = ref('')

const formData = ref({ nombre: '', id: '' })
const editingId = ref(null)
const deleteId = ref(null)

const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'id', label: 'ID', type: 'number' }
]

const editRowButton = () => `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800" title="Editar">${icons.edit} Editar</button>`
const deleteRowButton = () => `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800" title="Eliminar">${icons.delete} Eliminar</button>`

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

const columns = ref([
  { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 100 },
  { title: 'Nombre', field: 'nombre', hozAlign: 'left', widthGrow: 1 },
  { formatter: editRowButton, width: 120, hozAlign: 'center', cellClick: editRowClick },
  { formatter: deleteRowButton, width: 140, hozAlign: 'center', cellClick: deleteRowClick }
])

const tabulatorOptions = ref({
  locale: 'es-419',
  langs: es419,
  pagination: true,
  paginationMode: 'remote',
  ajaxURL: 'http://127.0.0.1:3333/departamentos',
  paginationSize: 5,
  layout: 'fitDataStretch',
  height: '80vh',
  footerElement: `<button class="ml-2 rounded px-4 py-1 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-1" id="agregar">${icons.add} Agregar</button>`
})

onMounted(() => {
  const table = tablaTabulator.value?.getTable()
  if (!table) return

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

const guardarCambios = async () => {
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

<!-- cambia los estilos de la tabla -->
<style scoped>
.tabulator {
  background-color: #ffffff; /* fondo de la tabla */
  color: #001f3f; /* texto azul oscuro */
  border: 1px solid #a0c4ff;
}

.tabulator .tabulator-header {
  background-color: #e0f0ff;
  color: #003366;
}

.tabulator .tabulator-row {
  background-color: #f0f8ff;
}

.tabulator .tabulator-row:hover {
  background-color: #d0e8ff;
}
</style>
