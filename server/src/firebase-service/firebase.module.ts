import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";
import { FirebaseService } from "./firebase.service";

@Global()
@Module({
  providers: [
    {
      provide: "FIREBASE_APP",
      useFactory: (configService: ConfigService) => {
        const projectId = configService.get<string>("FIREBASE_PROJECT_ID");
        const privateKey = configService
          .get<string>("FIREBASE_PRIVATE_KEY")
          ?.replace(/\\n/g, "\n");
        const clientEmail = configService.get<string>("FIREBASE_CLIENT_EMAIL");

        if (!projectId || !privateKey || !clientEmail) {
          throw new Error("Firebase configuration is incomplete");
        }

        const serviceAccount = {
          projectId,
          privateKey,
          clientEmail,
        };

        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: configService.get<string>("FIREBASE_DATABASE_URL"),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: "FIREBASE_FIRESTORE",
      useFactory: (app: admin.app.App) => {
        return app.firestore();
      },
      inject: ["FIREBASE_APP"],
    },
    FirebaseService,
  ],
  exports: ["FIREBASE_APP", "FIREBASE_FIRESTORE", FirebaseService],
})
export class FirebaseModule {}
