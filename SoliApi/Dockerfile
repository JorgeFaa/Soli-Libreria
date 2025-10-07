# Usamos JDK 21 ligero basado en Alpine
FROM eclipse-temurin:21-jdk-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos el JAR generado por Maven
COPY target/soliApi-1.0-SNAPSHOT.jar app.jar

# Exponemos el puerto que Spring Boot usará
EXPOSE 8080

# Configuramos la variable de entorno para Cloud Run
ENV PORT=8080

# Comando para ejecutar la app
ENTRYPOINT ["java","-jar","app.jar"]
