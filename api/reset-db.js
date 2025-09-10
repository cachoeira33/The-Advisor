// api/reset-db.js
const { execSync } = require('child_process');

console.log('Iniciando o reset do banco de dados local da Supabase...');

try {
  // Executa o comando e mostra a saída no terminal.
  // O stdio: 'inherit' é importante para vermos o que está acontecendo.
  execSync('npx supabase db reset', { stdio: 'inherit' });
  console.log('\n✅ Banco de dados resetado com sucesso!');
} catch (error) {
  console.error('\n❌ Falha ao resetar o banco de dados.');
  // O erro detalhado já terá sido exibido no terminal
  process.exit(1);
}
```
> **Nota:** Eu fiz uma pequena alteração no comando dentro do script para `npx supabase db reset`. Isso é um pouco mais robusto e pode ajudar a resolver problemas de `PATH` dentro do script.

**4. Cole o código no arquivo agora em branco.**

**5. Salve o arquivo.**

**6. Execute o script novamente no terminal:**