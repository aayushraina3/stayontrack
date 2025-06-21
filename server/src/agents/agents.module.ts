import { Module } from "@nestjs/common";
import { AgentsController } from "./agents.controller";
import { MotivatorService } from "./services/motivator.service";
import { PlannerService } from "./services/planner.service";
import { BlockerService } from "./services/blocker.service";
import { ObserverService } from "./services/observer.service";
import { AIService } from "../ai-service/ai.service";
import { RAGService } from "../rag-service/rag.service";
import { FirebaseService } from "../firebase-service/firebase.service";
import { SessionsModule } from "../sessions/sessions.module";
import { TasksModule } from "../tasks/tasks.module";

@Module({
  imports: [SessionsModule, TasksModule],
  controllers: [AgentsController],
  providers: [
    MotivatorService,
    PlannerService,
    BlockerService,
    ObserverService,
    AIService,
    RAGService,
    FirebaseService,
  ],
  exports: [MotivatorService, PlannerService, BlockerService, ObserverService],
})
export class AgentsModule {}
