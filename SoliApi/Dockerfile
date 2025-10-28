# Stage 1: Build stage with Maven
FROM eclipse-temurin:21-jdk-alpine AS build

# Instalar Maven
RUN apk add --no-cache maven

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero (para cache de layers)
COPY pom.xml .
COPY dependency-reduced-pom.xml .

# Descargar dependencias (se cachea si no cambian)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Compilar la aplicación
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jdk-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos el JAR desde la stage de build
COPY --from=build /app/target/soliApi-1.0-SNAPSHOT.jar app.jar

# Exponemos el puerto que Spring Boot usará
EXPOSE 8080

# Configuramos la variable de entorno para Cloud Run
ENV PORT=8080

ENV SPRING_PROFILES_ACTIVE=prod

# Comando para ejecutar la app
ENTRYPOINT ["java","-jar","app.jar"]
