## Visibilidade

- [ ] Esconder quando novo item
- [ ] Esconder quando formulário externo
- [ ] Condicional por valor do Formulário
- [ ] Condicional por tela de acesso

- Campo relação condicional nome: 
- Condição: 
- Valor esperado: 
- Operação: 

## Obrigatoriedade

- [ ] Obrigatório quando formulário externo
- [ ] Condicional por valor do Formulário
- [ ] Condicional por tela de acesso

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: igual a
- Valor esperado: `H`
- Operação: OU

> campo `prcs__conta_pai` é obrigatório quando o `TC_tipo_de_conta_valor` for igual a `H`

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: igual a
- Valor esperado: `HH`
- Operação: OU

> campo `prcs__conta_pai` é obrigatório quando o `TC_tipo_de_conta_valor` for igual a `HH`

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: igual a
- Valor esperado: `P`
- Operação: OU

> campo `prcs__conta_pai` é obrigatório quando o `TC_tipo_de_conta_valor` for igual a `P`

> obs: quando o `TC_tipo_de_conta_valor` for igual a `I`, o campo `prcs__conta_pai` não é obrigatório

## Somente Leitura

- [ ] Condicional por valor do Formulário
- [ ] Condicional por tela de acesso

- Campo relação condicional nome: registro_salvo / `registro_salvo_`
- Condição: igual a
- Valor esperado: `sim`
- Operação: E

> campo `prcs__conta_pai` é somente leitura quando o `registro_salvo_` for igual a `sim`

> obs: quando o `registro_salvo_` for igual a `nao`, o campo `prcs__conta_pai` não é somente leitura

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: igual a
- Valor esperado: `I`
- Operação: E

> campo `prcs__conta_pai` é somente leitura quando o `TC_tipo_de_conta_valor` for igual a `I`

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: igual a
- Valor esperado: `P`
- Operação: E

> campo `prcs__conta_pai` é somente leitura quando o `TC_tipo_de_conta_valor` for igual a `P`

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: igual a
- Valor esperado: `HH`
- Operação: E

> campo `prcs__conta_pai` é somente leitura quando o `TC_tipo_de_conta_valor` for igual a `HH`

> obs: quando o `TC_tipo_de_conta_valor` for igual a `H`, o campo `prcs__conta_pai` não é somente leitura
