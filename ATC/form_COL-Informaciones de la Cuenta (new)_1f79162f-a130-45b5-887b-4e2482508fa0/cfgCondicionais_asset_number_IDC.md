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
- Valor esperado: `P`
- Operação: OU

> campo `asset_number_IDC` é obrigatório quando o `TC_tipo_de_conta_valor` for igual a `P`

> obs: quando o `TC_tipo_de_conta_valor` for igual a `I` ou `H` ou `HH`, o campo `asset_number_IDC` não é obrigatório

## Somente Leitura

- [ ] Condicional por valor do Formulário
- [ ] Condicional por tela de acesso

- Campo relação condicional nome: registro_salvo / `registro_salvo_`
- Condição: igual a
- Valor esperado: `sim`
- Operação: E

> campo `asset_number_IDC` é somente leitura quando o `registro_salvo_` for igual a `sim`

> obs: quando o `registro_salvo_` for igual a `nao`, o campo `asset_number_IDC` não é somente leitura