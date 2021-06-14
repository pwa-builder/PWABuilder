import { ModalCloseEvent } from '../interfaces';

export function AppModalCloseEvent() {
  return new CustomEvent<ModalCloseEvent>('app-modal-close', {
    detail: {
      modalId: this.modalId,
    },
    composed: true,
    bubbles: true,
  });
}
