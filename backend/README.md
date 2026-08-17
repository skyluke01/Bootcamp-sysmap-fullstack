Backend - Sistema de Atividades

---

 Tecnologias

- Java 26
- Spring Boot
- PostgreSQL
- Liquibase
- JWT
- Gradle

---

 Como rodar o projeto

 Pré-requisitos

- Java 26
- Docker
- Git

---

  1. Clonar o repositório

  bash
  git clone git@github.com:bc-fullstack-07/Lucas-de-Oliveira-Mendes-Felix.git
  cd Lucas-de-Oliveira-Mendes-Felix/backend

  2. Subir dependências

  PostgreSQL

  Caso não possua o container criado
   
  docker run -d --name bootcamp -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bootcamp -p 5432:5432 postgres

  caso já possua 

  docker start bootcamp

  LocalStack (S3)

  Caso não possua o container
   
  docker run -d --name localstack -p 4566:4566 -e SERVICES=s3 -e DEBUG=1 -e LOCALSTACK_PERSISTENCE=1 localstack/localstack:4.4.0

  Caso já possua

  docker start localstack

  Criação da Bucket

  docker exec -it localstack awslocal s3 mb s3://profile-images

  3 - Rodar a aplicação

  Opção via terminal

  .\gradlew bootRun

  Opção via intellij
  Abrir projeto, localizar BackendApplication e executar o método main

  4 - Acesso a API
  
  http://localhost:8080

  Swagger

  http://localhost:8080/swagger-ui/index.html

  5 - Rodar os testes

  .\gradlew clean test
  
  Autor: 

  Lucas de Oliveira Mendes Felix

   
   



