export interface INotification {
  (topic: string, data?: any): void;
}