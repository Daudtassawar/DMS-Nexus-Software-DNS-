# ==============================
# 1. Build Stage
# ==============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["DMS.API.csproj", "./"]
RUN dotnet restore "./DMS.API.csproj"

# Copy the rest of the source code
COPY . .

# Install EF Core CLI tools locally
RUN dotnet tool install --global dotnet-ef --version 8.0.0
ENV PATH="$PATH:/root/.dotnet/tools"

# Generate EF migrations (or bundle them)
# We will create an idempotent SQL script of all migrations and execute it later, 
# or use the bundle approach. Since we just need to update the DB:
RUN ["/bin/bash", "-c", "export PATH=$PATH:/root/.dotnet/tools && dotnet ef migrations add AutoMigration$(date +%s) || true"]

# Build and Publish
RUN dotnet publish "DMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================
# 2. Runtime Stage
# ==============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000

# Optional: Add cultures if required, though basic API defaults are fine
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "DMS.API.dll"]
