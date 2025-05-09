<script setup>
import { ref, onMounted, computed } from 'vue'
import TabulatorTable from './components/TabulatorTable.vue'
import DialogTw from './components/DialogTw.vue'
import ButtonTw from './components/ButtonTw.vue'
import icons from './assets/svg-icons.js'
import es419 from './assets/es-419.js'
import FormTw from './components/FormTw.vue'

// se comentó la columna con formatter: 'star' porque no funciona correctamente con Tailwind
// En formatter: 'tickCross'  no funciona hozAlign: 'center'

const editRowButton = () => `<button id="edit-row" class="border-0 bg-transparent" title="Editar">${icons.edit}</button>`
const deleteRowButton = () => `<button id="delete-row" class="border-0 bg-transparent" title="Eliminar">${icons.delete}</button>`

const columns = ref([
    // las dos primeras columnas de iconos
    { formatter: editRowButton, width: 80, hozAlign: 'center', cellClick: editRowClick },
    { formatter: deleteRowButton, width: 80, hozAlign: 'center', cellClick: deleteRowClick },
    // definición de las columnas de la tabla
    { title: 'ID', field: 'id', sorter: 'number', hozAlign: 'center', width: 150 },
    { title: 'NOMBRE', field: 'nombre', width: 150 },
     { title: 'DEPARTAMENTO_ID', field: 'departamento_id', sorter: 'number', hozAlign: 'center', width: 150 },

])

const tabulatorOptions = ref({
   locale: true, // utilizar la configuración de idioma local
   langs: { 'es-419': es419 }, // utilizar español
   pagination: true,
   // ver https://tabulator.info/docs/6.3/page#remote
   paginationMode: 'remote',
   ajaxURL: 'http://127.0.0.1:3333/ciudades',
   paginationSize: 5,
   layout: 'fitColumns',
   footerElement: `<button class="-ml-2 rounded-sm px-4 py-1 bg-gray-200 
         hover:bg-gray-300 duration-300" id="agregar">
   Agregar
 </button>`
})



const tablaTabulator = ref(null)
let table = null

onMounted(async () => {
    table = tablaTabulator.value.getTable()
    table.on('tableBuilt', () => {
        const agregar = document.querySelector('#agregar')
        if (agregar) {
            agregar.addEventListener('click', () => {
                // Limpiar el formulario para nuevo registro
                formData.value = { 
                    nombre: '', 
                    id: '' ,
                    departamento_id: '' 
                }
                // Resetear el ID de edición
                editingId.value = null
                dialogTitle.value = 'Agregar album'
                if (dialogTw?.value?.popup) {
                    dialogTw.value.popup.show()
                }
            })
        }
    })
})

// Añadir la referencia para los datos del formulario
const formData = ref({

    nombre: '',
    id: '',
    departamento_id:''
})

// Definir la estructura del formulario
const formFields = [
  { id: 'nombre', label: 'Nombre', type: 'text' },
  { id: 'id', label: 'id', type: 'number' }
  { id: 'departamento_id', label: 'departamento_id', type: 'number' }

]

// Añadir variable para el ID del registro que se está editando
const editingId = ref(null)

// Agregar referencia para el registro a eliminar
const deleteId = ref(null)

function editRowClick(e, cell) {
    const rowData = cell.getRow().getData()
    dialogTitle.value = 'Editar album'
    // Guardamos el ID del registro que estamos editando
    editingId.value = rowData.id
    formData.value = { ...rowData }
    if (dialogTw?.value?.popup) {
        dialogTw.value.popup.show()
    }
}

function deleteRowClick(e, cell) {
    const rowData = cell.getRow().getData()
    deleteId.value = rowData.id
    dialogTitle.value = 'Eliminar album'
    formData.value = { ...rowData } // Mostrar datos del registro a eliminar
    if (dialogTw?.value?.popup) {
        dialogTw.value.popup.show()
    }
}

const guardarCambios = async () => {
    try {
        let response;
        
        if (editingId.value) {
            // Actualizar registro existente
            response = await fetch(`http://127.0.0.1:3333/ciudades/${editingId.value}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData.value)
            });
        } else {
            // Crear nuevo registro
            response = await fetch('http://127.0.0.1:3333/ciudades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData.value)
            });
        }

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Operación exitosa:', responseData);

        // Actualizar la tabla
        if (tablaTabulator.value) {
            const table = tablaTabulator.value.getTable();
            await table.replaceData(); // Esto volverá a cargar los datos de la API
        }

        // Limpiar el formulario y cerrar el diálogo
        formData.value = {nombre: '', id: '',departamento_id:'' }
        editingId.value = null
        cerrarDialog()

    } catch (error) {
        console.error('Error al guardar:', error)
        // Aquí podrías mostrar un mensaje de error al usuario
    }
}

const eliminarRegistro = async () => {
    try {
        const response = await fetch(`http://127.0.0.1:3333/ciudades/${deleteId.value}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // Actualizar la tabla
        if (tablaTabulator.value) {
            const table = tablaTabulator.value.getTable();
            await table.replaceData();
        }

        // Limpiar y cerrar el diálogo
        deleteId.value = null
        cerrarDialog()

    } catch (error) {
        console.error('Error al eliminar:', error)
    }
}

const hacerAlgo = () => {
  console.log('Acciones de hacer algo')
  cerrarDialog()
}


const cerrarDialog = () => {
  if (dialogTw?.value?.popup) {
    dialogTw.value.popup.close()
  } else {
    console.log('No hay acceso a la referencia popup')
  }
}

// Modificar los botones para mostrar diferentes opciones según la acción
const getButtons = () => {
    if (dialogTitle.value === 'Eliminar album') {
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
    <TabulatorTable
        :columns="columns"
        :options="tabulatorOptions"
        ref="tablaTabulator"
    />
    <DialogTw 
        ref="dialogTw" 
        :buttons="buttons" 
        :dialog-title="dialogTitle" 
        class="p-3"
    >
        <!-- Mostrar el formulario solo si no es eliminación -->
        <template v-if="dialogTitle !== 'Eliminar album'">
            <FormTw 
                :form-fields="formFields"
                v-model:form-data="formData"
                @submit="guardarCambios"
            />
        </template>
        <!-- Mostrar mensaje de confirmación si es eliminación -->
        <template v-else>
            <div class="p-4 text-center">
                <p class="text-lg text-red-700 dark:text-red-300">
                    ¿Está seguro que desea eliminar el álbum "{{ formData.title }}"?
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción no se puede deshacer.
                </p>
            </div>
        </template>
    </DialogTw>
</template>
