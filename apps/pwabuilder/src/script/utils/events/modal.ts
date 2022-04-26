import { ModalCloseEvent } from '../interfaces';

export function AppModalCloseEvent(modalId: string) {
  return new CustomEvent<ModalCloseEvent>('app-modal-close', {
    detail: {
      modalId: modalId,
    },
    composed: true,
    bubbles: true,
  });
}
