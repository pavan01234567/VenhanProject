FROM mcr.microsoft.com/dotnet/sdk:8.0-noble-amd64 AS build
ADD . /app
WORKDIR /app
RUN dotnet publish -C Release VenhanProject.csproj -o develop
EXPOSE 5000