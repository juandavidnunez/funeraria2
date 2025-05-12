<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import TabulatorTable from '../components/TabulatorTable.vue'
import DialogTw from '../components/DialogTw.vue'
import ButtonTw from '../components/ButtonTw.vue'
import FormTw from '../components/FormTw.vue'
import icons from '../assets/svg-icons.js'
import es419 from '../assets/es-419.js'

const route = useRoute()
const departamentoId = parseInt(route.params.departamentoId)

const tablaTabulator = ref(null)
const dialogTw = ref(null)
const dialogTitle = ref('')

const ciudades = ref([])
const formData = ref({ nombre: '', id: '' })
const editingId = ref(null)
const deleteId = ref(null)

const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'id', label: 'ID', type: 'number', attrs: { readonly: true } }
]

const ciudadesFiltradas = computed(() =>
  Array.isArray(ciudades.value)
    ? ciudades.value.filter(c => c.departamento_id === departamentoId)
    : []
)

const editRowButton = () => `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Editar">${icons.edit} Editar</button>`
const deleteRowButton = () => `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Eliminar">${icons.delete} Eliminar</button>`

function editRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  editingId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Editar ciudad'
  dialogTw.value?.popup?.show()
}

function deleteRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  deleteId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Eliminar ciudad'
  dialogTw.value?.popup?.show()
}

const columns = ref([
  { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 100 },
  { title: 'Nombre', field: 'nombre', widthGrow: 1 },
  { formatter: editRowButton, width: 120, hozAlign: 'center', cellClick: editRowClick },
  { formatter: deleteRowButton, width: 140, hozAlign: 'center', cellClick: deleteRowClick }
])

const tabulatorOptions = ref({
  locale: 'es-419',
  langs: { 'es-419': es419 },
  pagination: true,
  paginationSize: 5,
  layout: 'fitDataStretch',
  height: '80vh',
  footerElement: `<button class="ml-2 rounded-lg px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out flex items-center gap-2 shadow-lg hover:shadow-xl" id="agregar">${icons.add} Agregar</button>`
})

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3333/ciudades')
    const json = await res.json()
    ciudades.value = Array.isArray(json) ? json : json.data || []

    const table = tablaTabulator.value?.getTable()
    if (table) {
      table.setData(ciudadesFiltradas.value)

      const agregarButton = document.querySelector('#agregar')
      if (agregarButton) {
        agregarButton.addEventListener('click', () => {
          formData.value = { nombre: '', id: '' }
          editingId.value = null
          deleteId.value = null
          dialogTitle.value = 'Agregar ciudad'
          dialogTw.value?.popup?.show()
        })
      }
    }
  } catch (error) {
    console.error('Error al cargar ciudades:', error)
  }
})

const guardarCambios = async () => {
  try {
    const isEdit = !!editingId.value
    const url = isEdit
      ? `http://127.0.0.1:3333/ciudades/${editingId.value}`
      : 'http://127.0.0.1:3333/ciudades'
    const method = isEdit ? 'PUT' : 'POST'

    const body = {
      ...formData.value,
      departamento_id: departamentoId // Añadimos automáticamente el ID del departamento
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    const res = await fetch('http://127.0.0.1:3333/ciudades')
    const json = await res.json()
    ciudades.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(ciudadesFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al guardar ciudad:', error)
  }
}

const eliminarRegistro = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3333/ciudades/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    const res = await fetch('http://127.0.0.1:3333/ciudades')
    const json = await res.json()
    ciudades.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(ciudadesFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al eliminar ciudad:', error)
  }
}

const cerrarDialog = () => {
  dialogTw.value?.popup?.close()
}

const getButtons = () => {
  if (dialogTitle.value === 'Eliminar ciudad') {
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

  <DialogTw
    ref="dialogTw"
    :buttons="buttons"
    :dialog-title="dialogTitle"
    class="p-4"
  >
    <template v-if="dialogTitle !== 'Eliminar ciudad'">
      <FormTw
        :form-fields="formFields"
        v-model:form-data="formData"
        @submit.prevent="guardarCambios"
      />
    </template>
    <template v-else>
      <div class="p-4 text-center">
        <p class="text-lg text-red-700 dark:text-red-300">
          ¿Está seguro que desea eliminar la ciudad "{{ formData.nombre }}"?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </template>
  </DialogTw>
</template>
