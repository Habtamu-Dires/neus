# Stage 1: Build the native executable
FROM container-registry.oracle.com/graalvm/native-image:24.0.1 AS builder

WORKDIR /app
COPY . .
# Build and specify the output name explicitly
RUN ./mvnw package -Pnative -DskipTests -Dnative.image.name=neus-api

# ----------------------------------------
# Stage 2: Runtime image (use Alpine if unsure about dependencies)
FROM alpine:3.19
RUN apk add --no-cache gcompat  # For glibc compatibility

# time zone
RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/Africa/Addis_Ababa /etc/localtime \
    && echo "Africa/Addis_Ababa" > /etc/timezone

# Copy the binary from the builder
COPY --from=builder /app/target/neus-api .

# Run as non-root user for security  TODO: later
#RUN addgroup -S appgroup && adduser -S appuser -G appgroup
#USER appuser

CMD ["./neus-api"]


## Stage 2: Create a minimal runtime image
#FROM gcr.io/distroless/cc-debian11
#
## Copy the native executable from the builder
#COPY --from=builder /app/target/neus-api .
#
#ENV TZ="Africa/Addis_Ababa"
#
## Run the application
#CMD ["./neus-api"]