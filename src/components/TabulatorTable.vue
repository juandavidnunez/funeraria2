<script setup>
import { ref, onMounted, watch } from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_site_dark.min.css' 

// Crea la referencia para el div del template
const tabulatorRef = ref(null)

// Crea una referencia (tabulator) para la instancia de Tabulator
const tabulator = ref(null)

// Define las props del componente: columns, data y options
const props = defineProps({
    columns: {
        type: Array,
        required: true
    },
    // data: {
    //     type: Array,
    //     required: true
    // },
    options: {
        type: Object,
        default: () => ({})
    }
})

onMounted(() => {
    // Inicializa Tabulator con las props proporcionadas
    tabulator.value = new Tabulator(tabulatorRef.value, {
        columns: props.columns,
        data: props.data, 
        ...props.options
    })
})

// Observa los cambios en las props data y columns y actualiza la tabla

// watch(
//     () => props.data,
//     newData => {
//         if (tabulator.value) {
//             tabulator.value.setData(newData)
//         }
//     },
//     { deep: true }
// )

watch(
    () => props.columns,
    newColumns => {
        if (tabulator.value) {
            tabulator.value.setColumns(newColumns)
        }
    },
    { deep: true }
)

// Expone la instancia de tabulator, para hacerla accesible desde el componente padre
defineExpose({
    getTable: () => tabulator.value
})
</script>

<template>
    <!-- capa donde se renderiza la tabla -->
    <div ref="tabulatorRef"></div>
</template>

<style scoped>
/* 
    Aquí podría modificar los estilos de la tabla. Ejemplo:

   .tabulator-headers {
       background-color: #f0f0f0;
   }
*/
</style>

