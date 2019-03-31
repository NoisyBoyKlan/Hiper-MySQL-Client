# Hiperesp MySQL Client por Hiperesp
Um cliente MySQL em node.js

## Instalando
$ git clone https://github.com/hiperesp/Hiper-MySQL-Client.git

$ cd Hiper-MySQL-Client/

\# chmod 777 run

## Executando
Você pode configurar scripts com instruções para o Hiperesp MySQL Client.
Crie arquivos com quaisquer nomes contendo as instruções para serem executadas.
Após criar, execute digitando exec <nomedoarquivo>

Para desativar o autoexec, inicie com o parâmetro "-autoexec".
Exemplo: './run -autoexec'

Para forçar o autoexec, independente da configuração padrão, inicie com o parâmetro "+autoexec".
Exemplo: './run +autoexec'

Para iniciar múltiplos arquivos (similar a múltiplos "autoexec"), você pode adicionar o parâmetro "exec", seguido de arquivos.
Exemplo: './run -autoexec exec script1 script2 script3 script4'
