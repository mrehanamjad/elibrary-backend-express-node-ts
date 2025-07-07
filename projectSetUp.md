# Rest API project setup
## Steps:

First of all create an empty folder for the project

```bash
mkdir elib-apis
```
Initialize a node project
```bash
npm init
```

Setup TypeScript
```bash
npm install -D typescript ts-node nodemon @types/node
```

After installation initialize a tsconfig file.
```bash
npx tsc --init
```
Add Dev script in package.json file.
```json
"dev": "nodemon server.ts"
```
Setup Eslint
Head to https://eslint.org
```bash
npm init @eslint/config
```
- Make sure to install the eslint VSCode extention
by Microsoft.

Setup text formatting using Prettier
* Make sure to install the Prettier extension in VSCode.
* Create a prettierrc.json file in the root of the
project.
```json
{
"tabWidth": 2
}
```
Setup Express server.
* Install dependencies

```bash
npm i express
npm i -D @types/express
```
Setup project config.
* Install dotenv
```bash
npm i dotenv
npm i -D @types/dotenv
```
- Create config.ts file
= Export the config from the file.

Setup Mongo Database with Mongoose
```bash
npm i mongoose
npm i -D @types/mongoose
```
Setup Error handling.
* Install dependencies.
```bash
npm i http-errors
npm i -D @types/http-errors
```

-------------------------------




