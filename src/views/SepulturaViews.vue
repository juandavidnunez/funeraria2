<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import TabulatorTable from '../components/TabulatorTable.vue'
import DialogTw from '../components/DialogTw.vue'
import FormTw from '../components/FormTw.vue'
import icons from '../assets/svg-icons.js'
import es419 from '../assets/es-419.js'

const route = useRoute()
const servicioId = 2 // para sepultura es fijo 2

const tablaTabulator = ref(null)
const dialogTw = ref(null)
const dialogTitle = ref('')

const sepulturas = ref([])
const formData = ref({ id: '', ubicacion: '', fecha_hora: '', servicio_id: servicioId })
const editingId = ref(null)
const deleteId = ref(null)

const formFields = [
  { id: 'ubicacion', label: 'Ubicación', type: 'text' },
  { id: 'fecha_hora', label: 'Fecha y hora', type: 'datetime-local' }
]

const sepulturasFiltradas = computed(() =>
  Array.isArray(sepulturas.value)
    ? sepulturas.value.filter(s => s.servicio_id === servicioId)
    : []
)

const editRowButton = () => `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800">${icons.edit} Editar</button>`
const deleteRowButton = () => `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800">${icons.delete} Eliminar</button>`

function editRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  editingId.value = rowData.id
  formData.value = {
    ...rowData,
    fecha_hora: rowData.fecha_hora
      ? new Date(rowData.fecha_hora).toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
      : ''
  }
  dialogTitle.value = 'Editar sepultura'
  dialogTw.value?.popup?.show()
}

function deleteRowClick(e, cell) {
  const rowData = cell.getRow().getData()
  deleteId.value = rowData.id
  formData.value = { ...rowData }
  dialogTitle.value = 'Eliminar sepultura'
  dialogTw.value?.popup?.show()
}

const columns = ref([
  { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 80 },
  { title: 'Ubicación', field: 'ubicacion' },
  { title: 'Fecha y hora', field: 'fecha_hora' },
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
  footerElement: `<button class="ml-2 rounded-lg px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 shadow-lg" id="agregar">${icons.add} Agregar</button>`
})

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3333/sepulturas')
    const json = await res.json()
    sepulturas.value = Array.isArray(json) ? json : json.data || []

    const table = tablaTabulator.value?.getTable()
    if (table) {
      table.setData(sepulturasFiltradas.value)

      const agregar = document.querySelector('#agregar')
      if (agregar) {
        agregar.addEventListener('click', () => {
          formData.value = { ubicacion: '', fecha_hora: '', servicio_id: servicioId }
          editingId.value = null
          deleteId.value = null
          dialogTitle.value = 'Agregar sepultura'
          dialogTw.value?.popup?.show()
        })
      }
    }
  } catch (error) {
    console.error('Error al cargar sepulturas:', error)
  }
})

const guardarCambios = async () => {
  try {
    if (!formData.value.ubicacion || !formData.value.fecha_hora) {
      alert('Por favor completa todos los campos.')
      return
    }

    const isEdit = !!editingId.value
    const url = isEdit
      ? `http://127.0.0.1:3333/sepulturas/${editingId.value}`
      : 'http://127.0.0.1:3333/sepulturas'

    const method = isEdit ? 'PUT' : 'POST'

    // Formatear fecha a "YYYY-MM-DD HH:mm:ss"
    const fechaOriginal = formData.value.fecha_hora // "2025-05-29T14:30"
    const [datePart, timePart] = fechaOriginal.split('T')
    const fechaFormateada = `${datePart} ${timePart.length === 5 ? timePart + ':00' : timePart}`

    const payload = {
      ubicacion: formData.value.ubicacion,
      fecha_hora: fechaFormateada,
      servicio_id: servicioId
    }
    console.log('➡️ Enviando al backend:', JSON.stringify(payload, null, 2))

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorJson = await response.json()
      console.error('Error detallado desde backend:', errorJson)
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const res = await fetch('http://127.0.0.1:3333/sepulturas')
    const json = await res.json()
    sepulturas.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(sepulturasFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al guardar sepultura:', error)
  }
}

const eliminarRegistro = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3333/sepulturas/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

    const res = await fetch('http://127.0.0.1:3333/sepulturas')
    const json = await res.json()
    sepulturas.value = Array.isArray(json) ? json : json.data || []

    await tablaTabulator.value.getTable().setData(sepulturasFiltradas.value)
    cerrarDialog()
  } catch (error) {
    console.error('Error al eliminar sepultura:', error)
  }
}

const cerrarDialog = () => {
  dialogTw.value?.popup?.close()
}

const getButtons = () => {
  if (dialogTitle.value === 'Eliminar sepultura') {
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
    <template v-if="dialogTitle !== 'Eliminar sepultura'">
      <FormTw
        :form-fields="formFields"
        v-model:form-data="formData"
        @submit.prevent="guardarCambios"
      />
    </template>
    <template v-else>
      <div class="p-4 text-center">
        <p class="text-lg text-red-700 dark:text-red-300">
          ¿Está seguro que desea eliminar la sepultura en "{{ formData.ubicacion }}"?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </template>
  </DialogTw>
</template>
