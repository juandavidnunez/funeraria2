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
const errorDialog = ref(null)
const dialogTitle = ref('')
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref([])

const formData = ref({ nombre: '', id: '' })
const editingId = ref(null)
const deleteId = ref(null)

const usuario = ref(null)

onMounted(() => {
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

// Función para formatear errores de validación
const formatValidationErrors = (errors) => {
  const formattedErrors = []
  
  // Función auxiliar para extraer información de objetos de error
  const extractErrorInfo = (errorObj) => {
    if (typeof errorObj === 'string') {
      return errorObj
    }
    
    if (typeof errorObj === 'object' && errorObj !== null) {
      // Intentar extraer diferentes propiedades comunes de objetos de error
      const message = errorObj.message || errorObj.msg || errorObj.error || errorObj.detail
      const field = errorObj.field || errorObj.property || errorObj.param || errorObj.key
      const rule = errorObj.rule || errorObj.validation || errorObj.constraint
      const value = errorObj.value
      
      if (field && message) {
        return `${field}: ${message}`
      } else if (message) {
        return message
      } else if (field && rule) {
        return `${field}: Error de validación (${rule})`
      } else if (field) {
        return `${field}: Valor no válido${value ? ` (${value})` : ''}`
      } else {
        // Si no podemos extraer información específica, intentar JSON.stringify
        try {
          const jsonStr = JSON.stringify(errorObj)
          if (jsonStr !== '{}') {
            return `Error de validación: ${jsonStr}`
          }
        } catch (e) {
          // Si falla JSON.stringify, usar toString
          return `Error de validación: ${errorObj.toString()}`
        }
      }
    }
    
    return errorObj?.toString() || 'Error desconocido'
  }
  
  if (Array.isArray(errors)) {
    errors.forEach((error, index) => {
      const errorInfo = extractErrorInfo(error)
      formattedErrors.push(`• ${errorInfo}`)
    })
  } else if (typeof errors === 'object' && errors !== null) {
    // Si es un objeto con propiedades que son arrays de errores
    Object.keys(errors).forEach(field => {
      const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
      fieldErrors.forEach(error => {
        const errorInfo = extractErrorInfo(error)
        // Si ya incluye el campo, no lo duplicamos
        if (errorInfo.includes(`${field}:`)) {
          formattedErrors.push(`• ${errorInfo}`)
        } else {
          formattedErrors.push(`• ${field}: ${errorInfo}`)
        }
      })
    })
  } else if (typeof errors === 'string') {
    formattedErrors.push(`• ${errors}`)
  } else {
    // Fallback para otros tipos
    const errorInfo = extractErrorInfo(errors)
    formattedErrors.push(`• ${errorInfo}`)
  }
  
  return formattedErrors.length > 0 ? formattedErrors : ['Error de validación no especificado']
}

// Función para mostrar errores en ventana emergente
const showErrorDialog = (title, message, details = []) => {
  errorTitle.value = title
  errorMessage.value = message
  errorDetails.value = Array.isArray(details) ? details : []
  
  // Crear y mostrar el diálogo de error si no existe
  setTimeout(() => {
    if (errorDialog.value) {
      errorDialog.value.popup?.show()
    }
  }, 100)
}

// Función para cerrar el diálogo de error
const closeErrorDialog = () => {
  errorDialog.value?.popup?.close()
}

// Función para manejar errores HTTP
const handleHttpError = async (response, operation = 'operación') => {
  let errorData = null
  let errorBody = ''
  
  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json()
    } else {
      errorBody = await response.text()
    }
  } catch (parseError) {
    console.error('Error al parsear respuesta de error:', parseError)
  }

  switch (response.status) {
    case 422: // Unprocessable Entity - Errores de validación
      const validationErrors = errorData?.errors || errorData?.message || errorData
      const formattedErrors = formatValidationErrors(validationErrors)
      
      showErrorDialog(
        '❌ Error de Validación',
        `Los datos ingresados no cumplen con los requisitos del servidor. Por favor, revise y corrija los siguientes campos:`,
        formattedErrors.length > 0 ? formattedErrors : ['Los datos proporcionados no son válidos.']
      )
      break
      
    case 400: // Bad Request
      showErrorDialog(
        '❌ Solicitud Incorrecta',
        'La solicitud contiene datos incorrectos o incompletos.',
        errorData?.message ? [`• ${errorData.message}`] : ['Verifique que todos los campos estén correctamente completados.']
      )
      break
      
    case 401: // Unauthorized
      showErrorDialog(
        '🔒 Sin Autorización',
        'No tiene permisos para realizar esta acción.',
        ['Inicie sesión nuevamente o contacte al administrador.']
      )
      break
      
    case 403: // Forbidden
      showErrorDialog(
        '🚫 Acceso Denegado',
        'No tiene los permisos necesarios para realizar esta acción.',
        ['Contacte al administrador para obtener los permisos necesarios.']
      )
      break
      
    case 404: // Not Found
      showErrorDialog(
        '❓ No Encontrado',
        'El recurso solicitado no existe.',
        ['Verifique que el departamento exista o actualice la página.']
      )
      break
      
    case 409: // Conflict
      showErrorDialog(
        '⚠️ Conflicto',
        'Ya existe un registro con los mismos datos.',
        errorData?.message ? [`• ${errorData.message}`] : ['Verifique que no esté duplicando información.']
      )
      break
      
    case 500: // Internal Server Error
      showErrorDialog(
        '💥 Error del Servidor',
        'Ocurrió un error interno en el servidor.',
        ['Intente nuevamente en unos momentos or contacte al administrador.']
      )
      break
      
    case 503: // Service Unavailable
      showErrorDialog(
        '🔧 Servicio No Disponible',
        'El servidor no está disponible temporalmente.',
        ['Intente nuevamente en unos momentos.']
      )
      break
      
    default:
      showErrorDialog(
        `❌ Error ${response.status}`,
        `Ocurrió un error inesperado durante la ${operation}.`,
        [
          `Código de error: ${response.status}`,
          errorData?.message || errorBody || 'Error desconocido',
          'Intente nuevamente o contacte al administrador.'
        ]
      )
  }
}

const editRowButton = () => {
  if (!esAdmin.value) return ''
  return `<button class="flex items-center gap-1 border-0 bg-transparent text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Editar">${icons.edit} Editar</button>`
}

const deleteRowButton = () => {
  if (!esAdmin.value) return ''
  return `<button class="flex items-center gap-1 border-0 bg-transparent text-red-600 hover:text-red-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Eliminar">${icons.delete} Eliminar</button>`
}

const ciudadesRowButton = () => {
  return `<button class="flex items-center gap-1 border-0 bg-transparent text-emerald-600 hover:text-emerald-800 transition duration-200 ease-in-out rounded-lg py-1 px-4 shadow-md hover:shadow-lg" title="Ciudades">Ciudades</button>`
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
      ? `<button class="ml-2 rounded-lg px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition duration-200 ease-in-out flex items-center gap-2 shadow-lg hover:shadow-xl" id="agregar">${icons.add} Agregar</button>`
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

// Función para recargar datos de la tabla con manejo de errores
const recargarTabla = async () => {
  try {
    await tablaTabulator.value.getTable().replaceData()
  } catch (error) {
    console.error('Error al recargar datos:', error)
    showErrorDialog(
      '🌐 Error de Conexión',
      'No se pudieron recargar los datos de la tabla.',
      [
        'Verifique su conexión a internet',
        'Verifique que el servidor esté funcionando',
        'Intente actualizar la página'
      ]
    )
  }
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
  // Solo permitir si es admin
  if (!esAdmin.value) {
    showErrorDialog(
      '🔒 Sin Permisos',
      'No tiene permisos para realizar esta acción.',
      ['Contacte al administrador para obtener los permisos necesarios.']
    )
    return
  }

  try {
    // Validación básica del frontend
    if (!formData.value.nombre?.trim()) {
      showErrorDialog(
        '⚠️ Campo Requerido',
        'El nombre del departamento es obligatorio.',
        ['Por favor, ingrese un nombre válido para el departamento.']
      )
      return
    }

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

    if (!response.ok) {
      await handleHttpError(response, isEdit ? 'actualización de departamento' : 'creación de departamento')
      return
    }

    // Si la operación fue exitosa, recargar datos y cerrar diálogo
    await recargarTabla()
    cerrarDialog()
    
    // Mostrar mensaje de éxito
    showErrorDialog(
      '✅ Operación Exitosa',
      `El departamento ha sido ${isEdit ? 'actualizado' : 'creado'} correctamente.`,
      []
    )

  } catch (error) {
    console.error('Error de red al guardar departamento:', error)
    showErrorDialog(
      '🌐 Error de Conexión',
      'No se pudo conectar con el servidor para guardar los cambios.',
      [
        'Verifique su conexión a internet',
        'Verifique que el servidor esté funcionando',
        'Intente nuevamente en unos momentos'
      ]
    )
  }
}

const eliminarRegistro = async () => {
  // Solo permitir si es admin
  if (!esAdmin.value) {
    showErrorDialog(
      '🔒 Sin Permisos',
      'No tiene permisos para realizar esta acción.',
      ['Contacte al administrador para obtener los permisos necesarios.']
    )
    return
  }

  try {
    const response = await fetch(`http://127.0.0.1:3333/departamentos/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      await handleHttpError(response, 'eliminación de departamento')
      return
    }

    // Si la operación fue exitosa, recargar datos y cerrar diálogo
    await recargarTabla()
    cerrarDialog()
    
    // Mostrar mensaje de éxito
    showErrorDialog(
      '✅ Eliminación Exitosa',
      'El departamento ha sido eliminado correctamente.',
      []
    )

  } catch (error) {
    console.error('Error de red al eliminar departamento:', error)
    showErrorDialog(
      '🌐 Error de Conexión',
      'No se pudo conectar con el servidor para eliminar el departamento.',
      [
        'Verifique su conexión a internet',
        'Verifique que el servidor esté funcionando',
        'Intente nuevamente en unos momentos'
      ]
    )
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

// Botones para el diálogo de error
const errorButtons = [
  {
    id: 'btn-cerrar-error',
    textContent: 'Entendido',
    mode: 'btn-blue',
    handleClick: closeErrorDialog
  }
]
</script>

<template>
  <div class="w-full flex justify-center items-start p-6">
    <div class="w-full max-w-screen-xl">
      <TabulatorTable
        :key="tabulatorKey"
        :columns="columns"
        :options="tabulatorOptions"
        ref="tablaTabulator"
        class="rounded-lg border shadow-lg border-gray-300 bg-white"
      />
    </div>
  </div>

  <!-- Diálogo principal - Solo mostrar si es admin -->
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

  <!-- Diálogo de errores -->
  <DialogTw
    ref="errorDialog"
    :buttons="errorButtons"
    :dialog-title="errorTitle"
    class="p-4 max-w-lg"
  >
    <div class="p-4">
      <div class="mb-4">
        <p class="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
          {{ errorMessage }}
        </p>
      </div>
      
      <div v-if="errorDetails.length > 0" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
          Detalles del error:
        </h4>
        <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
          <li v-for="detail in errorDetails" :key="detail" class="leading-relaxed">
            {{ detail }}
          </li>
        </ul>
      </div>
    </div>
  </DialogTw>
</template>