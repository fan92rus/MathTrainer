import { ref } from 'vue'
import { useCityStore } from '@/store/city'
import { usePlayerStore } from '@/store/player'
import type { BuildingTemplate } from '@/types/gamification'
import ErrorHandler from '@/utils/ErrorHandler'

export interface BuildingResult {
  success: boolean
  message?: string
  buildingId?: string
}

export interface BuildingError {
  code: 'INSUFFICIENT_FUNDS' | 'INVALID_POSITION' | 'BUILD_ERROR' | 'UNKNOWN_ERROR'
  message: string
}

export function useBuildingLogic() {
  const cityStore = useCityStore()
  const playerStore = usePlayerStore()
  const isLoading = ref(false)
  const lastError = ref<BuildingError | null>(null)

  // Проверка доступности здания
  const checkBuildingAffordability = (template: BuildingTemplate): boolean => {
    return playerStore.currency.coins >= template.baseCost
  }

  // Обработка покупки здания
  const processBuildingPurchase = (template: BuildingTemplate): boolean => {
    return playerStore.spendCoins(template.baseCost)
  }

  // Основная функция обработки запроса на построение
  const handleBuildingRequest = async (
    template: BuildingTemplate,
    x: number,
    y: number
  ): Promise<BuildingResult> => {
    isLoading.value = true
    lastError.value = null

    try {
      // Проверяем доступность здания
      if (!checkBuildingAffordability(template)) {
        const error: BuildingError = {
          code: 'INSUFFICIENT_FUNDS',
          message: `Недостаточно монет для строительства "${template.name}". Требуется: ${template.baseCost}, доступно: ${playerStore.currency.coins}`
        }
        lastError.value = error
        return {
          success: false,
          message: error.message
        }
      }

      // Проверяем возможность построить на указанной позиции
      if (!cityStore.canBuildOn(x, y)) {
        const error: BuildingError = {
          code: 'INVALID_POSITION',
          message: 'Невозможно построить здание на этой позиции. Позиция занята или недоступна.'
        }
        lastError.value = error
        return {
          success: false,
          message: error.message
        }
      }

      // Обрабатываем покупку
      const purchaseSuccess = processBuildingPurchase(template)
      if (!purchaseSuccess) {
        const error: BuildingError = {
          code: 'INSUFFICIENT_FUNDS',
          message: 'Ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.'
        }
        lastError.value = error
        return {
          success: false,
          message: error.message
        }
      }

      // Добавляем здание в store
      const buildSuccess = cityStore.buildBuilding(template.id, x, y)
      if (!buildSuccess) {
        // Возвращаем деньги при ошибке построения
        playerStore.addCoins(template.baseCost)
        const error: BuildingError = {
          code: 'BUILD_ERROR',
          message: 'Не удалось построить здание. Деньги возвращены.'
        }
        lastError.value = error
        return {
          success: false,
          message: error.message
        }
      }

      // Успешное построение
      return {
        success: true,
        message: `Здание "${template.name}" успешно построено!`,
        buildingId: `${template.id}_${x}_${y}`
      }
    } catch (error) {
      ErrorHandler.handle(error as Error, 'useBuildingLogic.handleBuildingRequest')
      const errorObj: BuildingError = {
        code: 'UNKNOWN_ERROR',
        message: ErrorHandler.getUserMessage(error as Error)
      }
      lastError.value = errorObj
      return {
        success: false,
        message: errorObj.message
      }
    } finally {
      isLoading.value = false
    }
  }

  // Получить сообщение об успехе
  const getSuccessMessage = (template: BuildingTemplate): string => {
    const message = `Здание "${template.name}" успешно построено!`
    ErrorHandler.showUserMessage(message, 'success')
    return `🎉 ${message}`
  }

  // Получить сообщение об ошибке
  const getErrorMessage = (error: BuildingError): string => {
    ErrorHandler.showUserMessage(error.message, 'error')
    return `❌ ${error.message}`
  }

  // Сбросить ошибку
  const clearError = () => {
    lastError.value = null
  }

  return {
    isLoading,
    lastError,
    handleBuildingRequest,
    checkBuildingAffordability,
    processBuildingPurchase,
    getSuccessMessage,
    getErrorMessage,
    clearError
  }
}