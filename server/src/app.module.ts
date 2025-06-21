import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AgentsModule } from "./agents/agents.module";
import { TasksModule } from "./tasks/tasks.module";
import { SessionsModule } from "./sessions/sessions.module";
import { UsersModule } from "./users/users.module";
import { GoalsModule } from "./goals/goals.module";
import { FirebaseModule } from "./firebase-service/firebase.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    FirebaseModule,
    GoalsModule,
    AgentsModule,
    TasksModule,
    SessionsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
