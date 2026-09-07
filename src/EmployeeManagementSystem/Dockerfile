FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY EmployeeManagementSystem.csproj .
RUN dotnet restore EmployeeManagementSystem.csproj

COPY . .
RUN dotnet publish EmployeeManagementSystem.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "EmployeeManagementSystem.dll"]
