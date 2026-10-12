# Onergy — Automações BPM

Repositório central de scripts JavaScript para automação de processos na plataforma **Onergy** (BPM/low-code). Os scripts estendem as capacidades da plataforma implementando lógica de negócio personalizada, integrações com sistemas externos e processamento de dados.

---

## Estrutura do Repositório

```
onergy/                  # SDK principal — cliente REST Onergy + utilitários
  onergy-client.js       #   Wrapper da API REST (save, get, sendto, mail, cache, increment)
  onergy-utils.js        #   Funções auxiliares (base64, datas)

METODOS/                 # Funções utilitárias reutilizáveis
  Atalhos.js             #   Atalhos para operações comuns
  convert_data_atual_p_onergy.js
  deletarRegistroEmLote.js
  filter_or_&_indexOf.js.js
  funcitionLimparCNPJ_CPF.js
  getOnergyItem.js
  hashMd5.js
  limpar_registros.js
  OIS.js
  onergy_updatemany.js / onergy_updatemany_delet.js
  SaveDataByTemplateRule.js
  sendItemToOnergy.js
  SetObjectResponse.js
  somarHoras.js
  tela.js

[CLIENTE]/               # Automações específicas por cliente
  ATC/                   #   Cliente ATC (espanhol / português)
  BIOGEN/                #   Cliente BIOGEN (português)
  MITRE/                 #   Cliente MITRE (português) — maior volume

TEMPLATES/               # Templates de processos reutilizáveis
  proc_carga_excel_...   #   Carga de dados a partir de Excel

__tests__/               # Testes automatizados (Jest)
```

### Convenção de Diretórios por Cliente

Cada cliente pode conter:

| Subdiretório        | Finalidade                          |
| ------------------- | ----------------------------------- |
| `proc_[uuid]/`      | Processo de automação (1+ steps)    |
| `__prc__[nome]/`    | Scripts de processo (org. alternativa) |
| `__tela__[nome]/`   | Eventos de tela (before-save, after-load) |

---

## Setup

### 1. Clonar e Instalar Dependências

```bash
git clone https://github.com/jeferson-franco/onergy.git
cd onergy
npm install
```

### 2. (Opcional) Mover para Armazenamento em Nuvem

Feche o VSCode, mova a pasta do projeto para um diretório sincronizado (Google Drive, OneDrive, Dropbox) e reabra o VSCode. Isso mantém os scripts sincronizados entre máquinas.

---

## SDK — onergy-client.js

Todas as automações que precisam se comunicar com a API Onergy usam o módulo `onergy/onergy-client.js`. As principais funções exportadas são:

| Função                           | Descrição                                           |
| -------------------------------- | --------------------------------------------------- |
| `onergy_save(template, obj)`     | Criar/atualizar item no feed (POST)                 |
| `onergy_get(template, filter)`   | Consultar itens com filtro (GET)                    |
| `onergy_get_internal(...)`       | Consulta paginada com suporte a recursão            |
| `sendmail(to, subject, body)`    | Envio de e-mail transacional via Onergy             |
| `increment(chave)`               | Incrementar contador em feed                        |
| `saveInMemory(key, value)`       | Cache temporário (gateway)                          |
| `getInMemory(key)`               | Recuperar valor do cache                            |

**Uso básico:**

```javascript
const onergy = require('./onergy/onergy-client');

// Salvar um registro
onergy.onergy_save('MeuTemplate', { campo: 'valor' })
  .then(res => console.log('Salvo:', res))
  .catch(err => console.error('Erro:', err));

// Consultar registros
onergy.onergy_get('MeuTemplate', { filtro: 'valor' })
  .then(res => console.log('Registros:', res));
```

### Endpoints da API

| Base URL                                  | Serviço                    |
| ----------------------------------------- | -------------------------- |
| `https://gateway.onetech.com.br/v1`      | Gateway principal          |
| `https://gateway.onetech.com.br/ocs/api/cache` | Cache               |
| `https://hapi.onergy.com.br/api`          | E-mail, contador           |
| `https://api.onergy.com.br/api`           | API complementar           |
| `https://onergynodefunctions.azurewebsites.net/api` | Azure Functions (PDF, Excel) |

---

## Utilitários (METODOS/)

As funções em `METODOS/` são autônomas e podem ser copiadas para qualquer automação. Exemplos:

- `limparCNPJ_CPF` — remove máscara de documentos
- `hashMd5` — geração de hash MD5
- `somarHoras` — soma de horários
- `deletarRegistroEmLote` — exclusão em massa via API
- `onergy_updatemany` — atualização em lote

---

## Testes

O projeto utiliza **Jest** para testes automatizados.

```bash
npm test          # roda jest --watchAll
```

Os testes estão em `__tests__/`.

---

## Extensão VSCode Recomendada

**Auto Commit Message** — gera mensagens de commit automaticamente com base nos arquivos alterados.

- Nome: `MichaelCurrin.auto-commit-msg`
- [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=MichaelCurrin.auto-commit-msg)

---

## Notas Técnicas

- Os scripts executam no motor de automação do Onergy (Node.js server-side)
- As chamadas de API dependem da disponibilidade do gateway Onergy e estão sujeitas a limites de taxa
- Chaves de assinatura (`subscription-key`) estão embutidas no código-fonte — considere mover para variáveis de ambiente se seguro for requisito
- O pacote `request` (legado, callback-based) é o principal HTTP client; o projeto ainda não migrou para `axios` ou `fetch` nativo
- Cada script de processo executa como um passo de automação isolado dentro do motor do Onergy

---

## Licença

ISC
