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
const errorDialog = ref(null)
const dialogTitle = ref('')
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref([])

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
        ['Verifique que la sede exista o actualice la página.']
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
        ['Intente nuevamente en unos momentos o contacte al administrador.']
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

// Función para cargar sedes con manejo de errores
const cargarSedes = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3333/sedes')
    
    if (!response.ok) {
      await handleHttpError(response, 'carga de sedes')
      return
    }
    
    const json = await response.json()
    sedes.value = Array.isArray(json) ? json : json.data || []

    const table = tablaTabulator.value?.getTable()
    if (table) {
      table.setData(sedesFiltradas.value)
    }
  } catch (error) {
    console.error('Error de red al cargar sedes:', error)
    showErrorDialog(
      '🌐 Error de Conexión',
      'No se pudo conectar con el servidor.',
      [
        'Verifique su conexión a internet',
        'Verifique que el servidor esté funcionando',
        'Intente nuevamente en unos momentos'
      ]
    )
  }
}

onMounted(async () => {
  await cargarSedes()
  
  // Solo agregar event listener si es admin
  if (isAdmin) {
    setTimeout(() => {
      const agregarButton = document.querySelector('#agregar')
      if (agregarButton) {
        agregarButton.addEventListener('click', () => {
          formData.value = { nombre: '', direccion: '', telefono: '', correo_electronico: '' }
          editingId.value = null
          deleteId.value = null
          dialogTitle.value = 'Agregar sede'
          dialogTw.value?.popup?.show()
        })
      }
    }, 100)
  }
})

const guardarCambios = async () => {
  // Solo permitir si es admin
  if (!isAdmin) {
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
        'El nombre de la sede es obligatorio.',
        ['Por favor, ingrese un nombre válido para la sede.']
      )
      return
    }

    if (!formData.value.direccion?.trim()) {
      showErrorDialog(
        '⚠️ Campo Requerido',
        'La dirección de la sede es obligatoria.',
        ['Por favor, ingrese una dirección válida para la sede.']
      )
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

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      await handleHttpError(response, isEdit ? 'actualización de sede' : 'creación de sede')
      return
    }

    // Si la operación fue exitosa, recargar datos y cerrar diálogo
    await cargarSedes()
    cerrarDialog()
    
    // Mostrar mensaje de éxito
    showErrorDialog(
      '✅ Operación Exitosa',
      `La sede ha sido ${isEdit ? 'actualizada' : 'creada'} correctamente.`,
      []
    )

  } catch (error) {
    console.error('Error de red al guardar sede:', error)
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
  if (!isAdmin) {
    showErrorDialog(
      '🔒 Sin Permisos',
      'No tiene permisos para realizar esta acción.',
      ['Contacte al administrador para obtener los permisos necesarios.']
    )
    return
  }

  try {
    const response = await fetch(`http://127.0.0.1:3333/sedes/${deleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      await handleHttpError(response, 'eliminación de sede')
      return
    }

    // Si la operación fue exitosa, recargar datos y cerrar diálogo
    await cargarSedes()
    cerrarDialog()
    
    // Mostrar mensaje de éxito
    showErrorDialog(
      '✅ Eliminación Exitosa',
      'La sede ha sido eliminada correctamente.',
      []
    )

  } catch (error) {
    console.error('Error de red al eliminar sede:', error)
    showErrorDialog(
      '🌐 Error de Conexión',
      'No se pudo conectar con el servidor para eliminar la sede.',
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
        :columns="columns"
        :options="tabulatorOptions"
        ref="tablaTabulator"
        class="rounded-lg border shadow-lg border-gray-300 bg-white"
      />
    </div>
  </div>

  <!-- Diálogo principal - Solo mostrar si es admin -->
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