# Árvore B+ Implementada em JavaScript

Trabalho desenvolvido para a disciplina de Banco de Dados II com github.com/patriciacre.

# Execução

Para executar o programa utilizar NodeJS com versão igual
ou superior a v17.6.0.

exemplo

node app.js

Todos os testes foram executados dentro do algoritmo,
portanto a execução não recebe parâmetros.

Para alterar a ordem da árvore, mude a constante ORDEM na linha 5.

Para alterar o número de inserções ou remoções lidas do arquivo, mude
a constante RODA na linha 4.

É aconselhável aumentar a ordem proporcionalmente ao número de inserções ou
remoções. Por exemplo, para 9000 inserções/remoções utilize ordem 25.

Para alterar o arquivo csv utilizado para teste basta mudar o nome do
arquivo na linha 9. Os arquivos csv que já estão disponíveis na pasta 
para teste são "output20.csv", "output10.csv" e "output5.csv".

# Pesquisa

Para realizar a pesquisa por igualdade modifique a variável achar
na linha 672.

Para realizar a pesquisa por intervalo, modifique os parâmetros enviados
para a função na linha 684. O primeiro parâmetro é o começo da busca,
o segundo é o final da busca, e o terceiro é o tipo de comparações.

Os tipos de comparações são:

- 0 - entre o começo e o fim, incluindo os extremos.
    - exemplo: >= 13 && <= 260.
- 1 - entre o começo e o fim, excluindo os extremos.
    - exemplo: > 13 && < 260.
- 2 - entre o começo e o fim, incluindo apenas o começo.
    - exemplo: >= 13 && < 260.
- 3 - entre o começo e o fim, incluindo apenas o fim.
    - exemplo: > 13 && <= 260.
