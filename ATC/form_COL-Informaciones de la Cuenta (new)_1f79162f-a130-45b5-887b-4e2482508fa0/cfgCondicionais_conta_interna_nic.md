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

- Campo relação condicional nome: 
- Condição: igual 
- Valor esperado: 
- Operação: 

## Somente Leitura

- [ ] Condicional por valor do Formulário
- [ ] Condicional por tela de acesso

- Campo relação condicional nome: registro_salvo / `registro_salvo_`
- Condição: igual a
- Valor esperado: `sim`
- Operação: E

> campo `conta_interna_nic` é somente leitura quando o `registro_salvo_` for igual a `sim`

> obs: quando o `registro_salvo_` for igual a `nao`, o campo `conta_interna_nic` não é somente leitura