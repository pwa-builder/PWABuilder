// Interfaces for expected data for tracking analytics events

export interface CreateEventData {
  template: string,
  name: string,
  timeMS: number
}

export interface StartEventData {
  options: string,
  timeMS: number
}

export interface BuildEventData {
  timeMS: number
}