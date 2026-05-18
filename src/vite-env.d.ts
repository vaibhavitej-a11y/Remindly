/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface TimestampTrigger extends NotificationTrigger {
  readonly timestamp: number;
}

declare var TimestampTrigger: {
  prototype: TimestampTrigger;
  new (timestamp: number): TimestampTrigger;
};
