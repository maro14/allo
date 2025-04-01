import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmVariant?: 'primary' | 'danger' | 'secondary'
  isLoading?: boolean
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = 'primary',
  isLoading = false
}: ConfirmationModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}