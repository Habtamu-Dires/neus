# Build Stage
FROM ghcr.io/graalvm/jdk:21 AS build

# Install tar and curl
RUN apt-get update && apt-get install -y tar curl && rm -rf /var/lib/apt/lists/*

# Install Maven
RUN curl -s https://apache.osuosl.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz | tar xz -C /opt
ENV PATH="/opt/apache-maven-3.9.9/bin:${PATH}"

# Install native-image tool
RUN gu install native-image

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -Pnative -DskipTests

# Runtime Stage
FROM gcr.io/distroless/cc-debian11

ARG PROFILE=dev
ARG APP_VERSION=1.0.0

WORKDIR /app

# Copy the native executable (adjust name if different)
COPY --from=build /build/target/neus-api /app/neus-api

EXPOSE 8088

# Environment variables
ENV ACTIVE_PROFILE=${PROFILE}
ENV JAR_VERSION=${APP_VERSION}
ENV TZ="Africa/Addis_Ababa"

# Distroless images run as non-root by default and don’t support shell commands like apk,
# so timezone setup is omitted (native executable should handle TZ via app config if needed)

CMD ["/app/neus-api"]