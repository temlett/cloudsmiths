import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: false,
  });

  const port = Number(process.env.PORT ?? 3333);
  await app.listen(port);
  console.log(`Favorites API listening on http://localhost:${port}`);
}

void bootstrap();
