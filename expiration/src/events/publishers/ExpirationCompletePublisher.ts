import { Subjects, Publisher, ExpirationCompleteEvent } from "@rjmtix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
