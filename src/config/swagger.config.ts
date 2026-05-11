import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Ecommerce Backend API")
    .setDescription("API documentation for Ecommerce Backend")
    .setVersion("0.0.1")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger at '/swagger'
  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: { persistAuthorization: true },
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
    customSiteTitle: "Ecommerce Backend API Docs",
  });
}
