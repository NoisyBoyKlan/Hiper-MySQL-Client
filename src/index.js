const READER = require('readline').createInterface({input:process.stdin,output:process.stdout});
const MYSQL = require('mysql');

var connection = null;

var execStream = [];

function prompt(){
  if(execStream.length==0){
    READER.question("Hiperesp MySQL Client> ", run);
  } else {
    run(execStream.shift());
  }
}
function parseCommand(realCommand){
  let commandArgs = realCommand.split(" ");
  let command = "";
  while(command==""){
    command = ""+commandArgs.shift().trim();
    if(commandArgs.length==0){
      break;
    }
  }
  let args = commandArgs;
  return {"command": command, "args": args, "realCommand": realCommand};
}
function run(commandString){
  let parsedCommand = parseCommand(commandString);
  let command = parsedCommand.command.toLowerCase();

  let runCmd = help;
  if(command==""||command=="help"){
    runCmd = help;
  } else if(command=="#"){
    runCmd = comment;
  } else if(command=="exec"){
    runCmd = exec;
  } else if(command=="exit"||command=="die"||command=="quit"){
    runCmd = die;
  } else if(command=="print"||command=="echo"){
    runCmd = commandPrint;
  } else if(command=="clear"||command=="cls"){
    runCmd = clear;
  } else if(command=="connect"){
    runCmd = connect;
  } else if(command=="status"){
    runCmd = status;
  } else if(command=="disconnect"){
    runCmd = disconnect;
  } else if(command=="sql"){
    runCmd = sql;
  } else {
    runCmd = query;
  }
  runCmd(parsedCommand, prompt);
}
function comment(text, callback){
  if(callback) callback();
}
function print(text, callback){
  if(text){
    console.table(text);
  } else {
    console.log();
  }
  if(callback) callback();
}
function commandPrint(text, callback){
  console.table(text.args.join(" "));
  if(callback) callback();
}
function help(text, callback){
  print([
    {"Comando":"#",           "Efeito":"Comentário",                                          "Use":"# [comentário]"},
    {"Comando":"help",        "Efeito":"Mostra essa ajuda",                                   "Use":"help"},
    {"Comando":"",            "Efeito":"Um atalho para help",                                 "Use":""},
    {"Comando":"status",      "Efeito":"Mostra o status da conexão",                          "Use":"status"},
    {"Comando":"exec",        "Efeito":"Executa o arquivo",                                   "Use":"exec <arquivo>"},
    {"Comando":"exit",        "Efeito":"Fecha a conexão caso exista e finaliza o processo.",  "Use":"exit"},
    {"Comando":"die",         "Efeito":"Atalho para exit",                                    "Use":"die"},
    {"Comando":"quit",        "Efeito":"Atalho para exit",                                    "Use":"quit"},
    {"Comando":"clear",       "Efeito":"Limpa a tela",                                        "Use":"clear"},
    {"Comando":"cls",         "Efeito":"Atalho para clear",                                   "Use":"cls"},
    {"Comando":"connect",     "Efeito":"Abre uma conexão com o banco de dados",               "Use":"connect [host=localhost] [user=''] [password=''] [database='']"},
    {"Comando":"disconnect",  "Efeito":"Fecha a conexão caso exista",                         "Use":"disconnect"},
    {"Comando":"print",       "Efeito":"Escreve a mensagem na tela.",                         "Use":"print [mensagem]"},
    {"Comando":"echo",        "Efeito":"Atalho para print.",                                  "Use":"echo [mensagem]"},
    {"Comando":"sql",         "Efeito":"Executa um comando SQL",                              "Use":"sql <instrução SQL>", "Dica":"Omita \"sql\"."},
  ]);
  print([
    {"Legenda": "[]", "Tipo": "Opcional"},
    {"Legenda": "<>", "Tipo": "Obrigatório"}
  ]);
  if(callback) callback();
}
function die(text, callback){
  disconnect("", function(){
    process.exit(0);
  });
}
function clear(text, callback){
  console.clear();
  if(callback) callback();
}
function connect(text, callback){
  disconnect("", function(){
    connection = MYSQL.createConnection({host: text.args[0], user: text.args[1], password: text.args[2], database: text.args[3],});
    connection.connect(function(){
      status();
      if(callback) callback();
    });
  });
}
function status(text, callback){
  if(connection!=null){
    var connConf = {
      host: (connection.config.host||""),
      port: (connection.config.port||""),
      user: (connection.config.user||""),
      password: (connection.config.password||""),
      database: (connection.config.database||""),
      status: (connection.state)
    }
    print(connConf);
  } else {
    print("Não há conexão.");
  }
  if(callback) callback();
}
function disconnect(text, callback){
  if(connection!=null){
    if(connection.state!="disconnected"){
      connection.end(function(){
        if(callback) callback();
      });
      return;
    }
  }
  if(callback) callback();
}
function sql(text, callback){
  query(parseCommand(text.args.join(" ")), callback);
}
function query(command, callback) {
  if(connection!=null){
    if(connection.state!="disconnected"){
      connection.query(command.realCommand, function(error, results, fields){
        if(error){
          print(error.sqlMessage);
        } else {
          print(results);
        }
        if(callback) callback();
      });
      return;
    } else {
      print("Você não pode executar instruções SQL sem iniciar uma conexão.");
    }
  } else {
    print("Você não pode executar instruções SQL sem iniciar uma conexão.");
  }
  if(callback) callback();
}
function exec(text, callback){
  var filename;
  if(typeof text=="string"){
    filename = text;
  } else {
    filename = text.args.join(" ");
  }
  try {
    var autoexec = require('fs').readFileSync('./'+filename, 'utf8');
    while(autoexec.indexOf("\r\n")>-1){
      autoexec = autoexec.replace("\r\n", "\n");
    }
    while(autoexec.indexOf("\r")>-1){
      autoexec = autoexec.replace("\r", "\n");
    }
    autoexec = autoexec.split("\n");
    for(var i=0; i<autoexec.length; i++){
      if(autoexec[i]!=""){
        execStream.push(autoexec[i]);
      }
    }
  } catch(e){
    print("Ocorreu um erro ao abrir o arquivo "+filename);
  }
  if(callback) callback();
}

var
enableAutoexec = true,
filesToExec = [];

for(var i=0; i<process.argv.length; i++){
  switch(process.argv[i]){
    case "-autoexec":
      enableAutoexec = false;
      break;
    case "+autoexec":
      enableAutoexec = true;
      break;
    case "exec":
      for(var j=0; j<process.argv.length; j++, i++){
        filesToExec[filesToExec.length] = process.argv[j];
      }
      break;
  }
}
if(enableAutoexec){
  exec("autoexec");
}
for(let i=0; i<filesToExec.length; i++) {
  exec(filesToExec[i]);
}
prompt();