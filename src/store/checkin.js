import { ref } from 'vue'

export const checkinTab = ref('scan')

export const setCheckinTab = (tab) => {
  checkinTab.value = tab
}
