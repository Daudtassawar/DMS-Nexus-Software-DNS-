# ==============================
# 1. Build Stage
# ==============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies first (layer cache optimisation)
COPY ["DMS.API.csproj", "./"]
RUN dotnet restore "./DMS.API.csproj"

# Copy the rest of the source code
COPY . .

# Build and publish (Release)
RUN dotnet publish "DMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================
# 2. Runtime Stage
# ==============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Render injects PORT at runtime; fall back to 5000 for local Docker use.
# The app itself reads process.env.PORT via Environment.GetEnvironmentVariable("PORT").
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "DMS.API.dll"]
