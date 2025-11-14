# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-noble-amd64 AS build
WORKDIR /src
COPY . .
RUN dotnet publish VenhanProject.csproj -c Release -o /app/develop

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-noble-amd64 AS runtime
WORKDIR /app
COPY --from=build /app/develop .

EXPOSE 5000
ENTRYPOINT ["dotnet", "VenhanProject.dll"]