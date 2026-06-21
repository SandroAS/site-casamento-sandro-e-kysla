# Site de casamento — Kysla e Sandro

Site estático em Vue 3 + Tailwind para divulgar o casamento, lista de presentes em cotas, confirmação de presença e pagamento via PIX.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

## Build para produção

```bash
npm run build
```

A pasta `dist/` contém os arquivos estáticos para publicar (Netlify, Vercel, GitHub Pages, etc.).

```bash
npm run preview
```

## Editar dados do site

Tudo fica em **`public/data/site.json`** — edite e salve; no `npm run dev` basta recarregar a página.

### Casamento e PIX

- `couple`, `event`: nomes, data, local, mapa
- `pix`: chave `31998136678`, nome do recebedor, cidade (máx. 15 caracteres no QR Code)
- `contact`: WhatsApp para envio de comprovante (opcional)

### Adicionar um presente

```json
{
  "id": "airfryer",
  "title": "Air fryer",
  "image": "/images/gifts/airfryer.jpg",
  "totalValue": 400,
  "quotaCount": 4
}
```

Se omitir `quotas`, o site cria `quotaCount` cotas iguais automaticamente.

### Marcar cota como reservada ou paga

Altere o `status` de cada cota em `quotas`:

- `"available"` — disponível
- `"reserved"` — alguém pagou, aguardando confirmação
- `"paid"` — confirmado

Exemplo:

```json
{ "id": "geladeira-1", "value": 500, "status": "paid" }
```

### Lista de convidados e confirmação de presença

A lista fica em **`public/data/rsvp.json`**. Os convidados usam os botões do site para abrir o WhatsApp e avisar os noivos; **você atualiza o `status` manualmente** após receber a mensagem.

#### Adicionar ou editar um convidado

```json
{
  "id": "guest-66",
  "name": "Nome Completo",
  "status": "pending"
}
```

- `id` — identificador único (ex.: `guest-66`, `guest-14-1`)
- `name` — nome exibido no site
- `status` — situação da confirmação (veja abaixo)

#### Status possíveis

| Status | Significado | Exibição no site |
|--------|-------------|------------------|
| `"pending"` | Ainda não confirmou nem desistiu | Pendente |
| `"confirmed"` | Vai comparecer | Confirmado |
| `"declined"` | Não vai comparecer | Não vai |

Exemplo após confirmar alguém pelo WhatsApp:

```json
{ "id": "guest-05", "name": "Karen Karonline", "status": "confirmed" }
```

Exemplo de desistência:

```json
{ "id": "guest-12", "name": "Marcelo Araujo", "status": "declined" }
```

Depois de editar, faça commit e push — o Netlify publica a lista atualizada.

### Imagens

| Arquivo | Uso |
|---------|-----|
| `public/images/save-the-date.png` | Ilustração do convite (hero) |
| `public/images/casal-*.jpg` | Fotos do casal (edite em `EventSection.vue` ou troque URLs no componente) |
| `public/images/gifts/*.jpg` | Fotos dos presentes (use caminhos locais no JSON) |

## PIX

- Chave: **31998136678** (telefone)
- Recebedor: **Sandro Antônio Souza**
- QR Codes são gerados no navegador (sem backend)
- Não há reserva automática de cotas — atualize o JSON após confirmar o pagamento no banco

## Deploy

1. `npm run build`
2. Publique o conteúdo de `dist/`
3. Para atualizar só a lista de presentes em alguns hosts, você pode substituir `dist/data/site.json` sem novo build (o JSON é carregado em tempo de execução)

## Tecnologias

- Vue 3, Vite, Vue Router
- Tailwind CSS v4
- [pix-utils](https://github.com/thalesog/pix-utils) — payload PIX
- [qrcode](https://www.npmjs.com/package/qrcode) — QR Code
