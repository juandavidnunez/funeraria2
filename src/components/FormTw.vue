<script setup>
const props = defineProps({
  formFields: {
    type: Array,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:formData'])

const updateField = (field, value) => {
  const updatedData = { ...props.formData }
  updatedData[field] = value
  emit('update:formData', updatedData)
}
</script>

<template>
  <form @submit.prevent="$emit('submit')" class="space-y-6 w-full">
    <div v-for="field in formFields" :key="field.id" class="mb-6">
      <label :for="field.id" class="block text-lg font-semibold mb-2">
        {{ field.label }}
      </label>

      <!-- Campo checkbox -->
      <div v-if="field.type === 'checkbox'" class="flex items-center gap-3">
        <input
          type="checkbox"
          :id="field.id"
          :checked="formData[field.id]"
          @change="updateField(field.id, $event.target.checked)"
          class="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
        />
        <label :for="field.id" class="text-gray-200 text-base">{{ field.label }}</label>
      </div>

      <!-- Campo texto, número, etc. -->
      <input
        v-else
        :type="field.type"
        :id="field.id"
        :value="formData[field.id]"
        :placeholder="`Ingrese ${field.label.toLowerCase()}`"
        @input="updateField(field.id, $event.target.value)"
        class="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white px-4 py-3 
               shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
               placeholder-gray-400"
      />
    </div>
  </form>
</template>
