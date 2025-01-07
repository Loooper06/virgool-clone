import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle("Virgool")
    .setDescription("Virgool Clone Backend")
    .setVersion("v0.0.1")
    .addBearerAuth(SwaggerAuthConfig(), "Authorization")
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup("/swagger", app, swaggerDocument);
}

function SwaggerAuthConfig(): SecuritySchemeObject {
  return {
    in: "header",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  };
}
