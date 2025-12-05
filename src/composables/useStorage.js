export function useStorage() {
  const getItem = (key) => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`)
      return null
    }
  }
  
  const setItem = (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error setting item to localStorage: ${error}`)
    }
  }
  
  const removeItem = (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`)
    }
  }
  
  return {
    getItem,
    setItem,
    removeItem
  }
}