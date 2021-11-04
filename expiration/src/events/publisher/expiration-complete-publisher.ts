import {
  ExpirationCompleteEvent,
  Subjects,
  Publisher,
} from '@cgtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
