
## 🚀 Endpoints da API (Postman)

Base URL: `http://localhost:3000/api`

### 🔐 Autenticação

#### **Registrar Usuário**
Cria uma nova conta no sistema.
* **URL:** `/auth/register`
* **Método:** `POST`
* **Body (JSON):**
```json
{
    "name": "test test",
    "email": "tests@gmail.com",
    "password": "senha_forte_!@#$QWEERT",
    "role": "ADMIN"
}
```

#### **Login**
Autentica o usuário e retorna o token de acesso.
* **URL:** `/auth/login`
* **Método:** `POST`
* **Body (JSON):**
```json
{
    "email": "test@gmail.com",
    "password": "senha_forte_!@#$QWEERT"
}
```

---

### 💼 Vagas (Jobs)

#### **Listar Vagas**
Retorna a lista de todas as vagas disponíveis.
* **URL:** `/jobs`
* **Método:** `GET`

---

### 💡 Dica para o Postman
Para facilitar os testes, você pode criar uma **Environment** no Postman e definir uma variável `base_url` como `http://localhost:3000/api`. Assim, seus endereços ficam simplificados como `{{base_url}}/auth/login`.