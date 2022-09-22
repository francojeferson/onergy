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
- Condição: diferente de
- Valor esperado: `I`
- Operação: E

> campo `prcs__conta_pai` é obrigatório quando o `TC_tipo_de_conta_valor` for diferente de `I`

> obs: quando o `TC_tipo_de_conta_valor` for igual a `H` ou `HH` ou `P`, o campo `prcs__conta_pai` não é obrigatório

## Somente Leitura

- [ ] Condicional por valor do Formulário
- [ ] Condicional por tela de acesso

- Campo relação condicional nome: registro_salvo / `registro_salvo_`
- Condição: igual a
- Valor esperado: `sim`
- Operação: OU

> campo `prcs__conta_pai` é somente leitura quando o `registro_salvo_` for igual a `sim`

> obs: quando o `registro_salvo_` for igual a `nao`, o campo `prcs__conta_pai` não é somente leitura

- Campo relação condicional nome: Tipo de Conta / `TC_tipo_de_conta_valor`
- Condição: diferente de
- Valor esperado: `H`
- Operação: OU

> campo `prcs__conta_pai` é somente leitura quando o `TC_tipo_de_conta_valor` for diferente de `H`

> obs: quando o `TC_tipo_de_conta_valor` for igual a `HH` ou `P` ou `I`, o campo `prcs__conta_pai` não é somente leitura
