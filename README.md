# DIGITEAM Freshworks App – Monorepo

This monorepo contains multiple packages for **Freshservice** and **Zendesk** integrations using **Nx**.
Follow the instructions below to properly **install**, **configure**, and **run** the project.

---

## 📦 Installation

1. **Install dependencies in the root folder:**
   ```bash
   npm install
   ```
2. **Navigate to the Freshservice package and install additional dependencies:**
   ```bash
   cd packages/freshservice
   npm install
   ```

---

## 🚀 Running Freshservice App

1. **Use Node 18.18.2** (recommended with [NVM](https://github.com/nvm-sh/nvm)):
   ```bash
   nvm use 18.18.2
   ```
2. **Start the Freshservice development environment:**
   ```bash
   npx nx run freshservice:fdk
   ```

---

## 💻 Running Zendesk App

1. **Use Node 22.12.0:**
   ```bash
   nvm use 22.12.0
   ```
2. **Run the Zendesk app in two terminals:**

   **Terminal 1:**
   ```bash
   npx nx run zendesk:dev
   ```
   **Terminal 2:**
   ```bash
   npx nx run zendesk:start
   ```

---

# 🌍 Português (Brasil)

Este projeto contém múltiplos pacotes para integrações com **Freshservice** e **Zendesk** usando **Nx**.
Siga as instruções abaixo para configurar e iniciar o projeto corretamente.

---

## 📦 Instalação

1. **Instale as dependências na pasta raiz:**
   ```bash
   npm install
   ```
2. **Vá até o pacote Freshservice e instale as dependências adicionais:**
   ```bash
   cd packages/freshservice
   npm install
   ```

---

## 🚀 Executando Freshservice

1. **Use Node 18.18.2 (via NVM):**
   ```bash
   nvm use 18.18.2
   ```
2. **Inicie o ambiente de desenvolvimento:**
   ```bash
   npx nx run freshservice:fdk
   ```

---

## 💻 Executando Zendesk

1. **Use Node 22.12.0:**
   ```bash
   nvm use 22.12.0
   ```
2. **Execute em dois terminais:**

   **Terminal 1:**
   ```bash
   npx nx run zendesk:dev
   ```
   **Terminal 2:**
   ```bash
   npx nx run zendesk:start
   ```

---

# 🇪🇸 Español

Este proyecto contiene múltiples paquetes para integraciones con **Freshservice** y **Zendesk** usando **Nx**.
Sigue las instrucciones a continuación para configurar e iniciar el proyecto correctamente.

---

## 📦 Instalación

1. **Instala las dependencias en la carpeta raíz:**
   ```bash
   npm install
   ```
2. **Ingresa a la carpeta Freshservice e instala las dependencias adicionales:**
   ```bash
   cd packages/freshservice
   npm install
   ```

---

## 🚀 Ejecutar Freshservice

1. **Usa Node 18.18.2 (recomendado con NVM):**
   ```bash
   nvm use 18.18.2
   ```
2. **Inicia el entorno de desarrollo:**
   ```bash
   npx nx run freshservice:fdk
   ```

---

## 💻 Ejecutar Zendesk

1. **Usa Node 22.12.0:**
   ```bash
   nvm use 22.12.0
   ```
2. **Ejecuta en dos terminales:**

   **Terminal 1:**
   ```bash
   npx nx run zendesk:dev
   ```
   **Terminal 2:**
   ```bash
   npx nx run zendesk:start
   ```

---

## 📌 Notes

- Ensure you have **NVM** installed to manage Node versions.
- Run each app in its recommended Node version to avoid compatibility issues.
