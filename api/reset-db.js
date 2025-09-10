// api/reset-db.js
const { execSync } = require('child_process');

console.log('Iniciando o reset do banco de dados local da Supabase...');

// Este é o caminho para o executável, relativo à raiz do projeto.
const command = './api/node_modules/.bin/supabase db reset';

try {
  // Executa o comando e mostra a saída no terminal.
  // O stdio: 'inherit' é importante para vermos o que está acontecendo.
  execSync(command, { stdio: 'inherit' });
  console.log('\n✅ Banco de dados resetado com sucesso!');
} catch (error) {
  console.error('\n❌ Falha ao resetar o banco de dados.');
  // O erro detalhado já terá sido exibido no terminal pelo stdio: 'inherit'
  process.exit(1); // Encerra o script com um código de erro
}
```

**3. Execute o script**
Agora, no seu terminal, na **raiz do projeto**, execute o seguinte comando:

```bash
node api/reset-db.js