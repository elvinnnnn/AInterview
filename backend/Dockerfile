# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# restore
WORKDIR /src
COPY backend.csproj ./
RUN dotnet restore './backend.csproj'

# build
COPY . ./
RUN dotnet build 'backend.csproj' -c Release -o /app/build

# publish
FROM build AS publish
RUN dotnet publish 'backend.csproj' -c Release -o /app/publish

# run
FROM mcr.microsoft.com/dotnet/aspnet:8.0
ENV ASPNETCORE_HTTP_PORTS=5000
EXPOSE 5000
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "backend.dll"]