import { Test, TestingModule } from "@nestjs/testing";
import { AgentsController } from "./agents.controller";
import { PlannerService } from "./services/planner.service";
import { MotivatorService } from "./services/motivator.service";
import { ObserverService } from "./services/observer.service";
import { BlockerService } from "./services/blocker.service";

describe("AgentsController", () => {
  let controller: AgentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        PlannerService,
        MotivatorService,
        ObserverService,
        BlockerService,
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
