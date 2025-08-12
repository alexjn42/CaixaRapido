# Caixa Rápido (Web)
Aplicativo simples para registrar **Vendas**, **Saques (30%)** e **Retiradas**, com **Resumo por Período** — tudo local no navegador (localStorage).

## Rodando no Chrome
1. Baixe o ZIP e extraia numa pasta.
2. Abra `index.html` no Chrome (duplo clique ou arraste o arquivo para o navegador).
3. O campo de valor já abre focado. Digite um valor (ex.: `123,45`) e clique em **Venda**, **Saque (30%)** ou **Retirada**.
4. Use o bloco **Resumo do Período** para escolher **De/Até** e clique em **Aplicar**, **Hoje** ou **Este mês**.
5. O histórico do período aparece em **Histórico** (abre/fecha).

> Dica: pressione **Enter** no campo de valor para adicionar rapidamente como **Venda**.

## Como funciona o Saque (30%)
- Ao registrar um Saque, o valor entra no total de saques.
- No resumo mostramos **30%** e o **resto (70%)** apenas para referência.
- O **Saldo** é calculado como: `Vendas - Retiradas - Saques`.

## Exportar/Importar
- **Exportar** gera um arquivo `somandoaqui-dados.json` com todos os registros.
- **Importar** permite restaurar dados a partir desse JSON.
- **Limpar registros (por período)** remove entradas dentro do intervalo selecionado.

## Armazenamento
- Os dados ficam no **localStorage** deste navegador. Se limpar o cache do navegador, os dados podem ser apagados.
- Se quiser sincronizar entre dispositivos, exporte o JSON e faça backup/reimportação.

## Estrutura de dados
```json
{ "type": "VENDA|SAQUE|RETIRADA", "amountCents": 12345, "ts": 1731022345123 }
```


## Publicar no GitHub

1. Crie um repositório no GitHub (ex.: `caixa-rapido`).
2. No terminal, dentro da pasta do projeto, rode:

```bash
git init
git add .
git commit -m "feat: Caixa Rápido web v1"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/caixa-rapido.git
git push -u origin main
```

3. Vá em **Settings > Pages**, selecione **Build and deployment: GitHub Actions** (ou deixe automático). O workflow já está em `.github/workflows/pages.yml`.  
4. Após o push, aguarde o deploy. O link do site aparecerá nos **Actions** e em **Settings > Pages**.


## PWA (instalar como app)
- Já incluso **manifest.json**, **ícones** e **service worker**.
- Depois do deploy no GitHub Pages (HTTPS), abra o site no **Chrome** (desktop ou Android) e use **Instalar app** no menu do navegador.
- Atualizações: quando você fizer novo push, o navegador busca a nova versão do service worker; ao recarregar a página, a atualização é aplicada.
