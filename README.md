# DB Challenge

## Create Migration

```console
npx typeorm migration:create src/migrations/CreateProductSalesMaterializedView
```

## Run Migration

```console
npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
```
