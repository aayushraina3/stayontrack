import { Module } from "@nestjs/common";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";
import { FirebaseService } from "../firebase-service/firebase.service";

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, FirebaseService],
  exports: [SessionsService],
})
export class SessionsModule {}
