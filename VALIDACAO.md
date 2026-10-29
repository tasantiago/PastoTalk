# Validação da versão reconstruída

| Verificação | Resultado |
| --- | --- |
| Go: testes de tokens, papéis, validação e privacidade com detector de concorrência | Passaram |
| go vet | Passou |
| TypeScript e build de produção | Passaram |
| ESLint | Passou |
| npm audit | 0 vulnerabilidades |
| Integração HTTP com a API local e PostgreSQL 16 | 8 testes passaram |
| Navegador no Vite: desktop e celular | 6 testes passaram |
| Migrações 001 e 002 sobre o esquema original, executadas duas vezes | Passaram |
| Docker: construção e inicialização | Passaram; PostgreSQL e API saudáveis |
| Integração HTTP contra a imagem da API | 8 testes passaram |
| Navegador contra o build servido pelo Nginx: desktop e celular | 6 testes passaram |

A integração HTTP cobre cadastro, login, perfil, CORS/Bearer, todos os módulos,
validações, isolamento entre contas e propriedades, preços por data/propriedade,
arquivamento, totais mensais, papéis, revogação e rebaixamento simultâneo de
administradores. Confere que o último administrador permanece e que membros
não expõem senhas ou e-mails.

O navegador cobre criação da conta e propriedade, produção de leite, edição,
receitas, despesas, painel, sessão, saída, login inválido, inclusão de membros,
mudança de papel, consulta sem edição, lançamentos por colaborador e remoção
pela interface. Confere a largura da página em desktop e celular.

A migração preservou dois vínculos como administradores, produção de 125,750
litros, receita de R$ 123,45, data de venda e URL de foto. Validou padrão viewer
e rejeição de papel inválido. O banco novo foi inicializado pelo Compose.

Ambientes: Go 1.25.14 e Node 24.19 no host; Go 1.25, Node 22, PostgreSQL 16 e
Nginx 1.28 no Docker. Todos os dados foram gerados em ambientes exclusivos de
teste. Nenhuma execução usou banco de produção.

Esta versão foi reconstruída após a indisponibilidade do ambiente anterior.
Mantém o escopo funcional combinado; não é uma cópia byte a byte do ZIP perdido.
Não houve publicação em provedor nem envio ao GitHub.

A entrega inclui ZIP, cópia do histórico em Git bundle e arquivo de restauração
em texto. O ZIP passou na verificação CRC. A extração pelo arquivo de restauração
foi conferida contra os hashes dos arquivos do ZIP.
