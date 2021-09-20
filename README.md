## Description

Prontuário Médico Eletronico, usando o framework NestJS

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# run docker compose
$ docker-compose up -d db

# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test
É necessário ter o docker instalado, para rodar os testes de integração.

```bash
# run docker compose
$ docker-compose up -d db_test
# e2e tests
$ yarn test:e2e
```

## Documentation
A documentação da API está na rota /api . A documentação foi criada usando o swagger.
