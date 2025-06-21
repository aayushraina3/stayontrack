import { Module } from "@nestjs/common";
import { GoalsController } from "./goals.controller";
import { GoalsService } from "./goals.service";
import { FirebaseModule } from "../firebase-service/firebase.module";

@Module({
  imports: [FirebaseModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
