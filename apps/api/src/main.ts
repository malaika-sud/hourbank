import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { getApiConfig } from "./config/env.js";

async function bootstrap() {
  const config = getApiConfig();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: config.corsOrigin,
  });

  await app.listen(config.port);
}

void bootstrap();
