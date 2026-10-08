/**
 * Casamento Perfeito
 * API de envio de pré-convite por e-mail
 *
 * Endpoint:
 * POST /api/enviar-pre-convite
 *
 * Variáveis de ambiente necessárias:
 * RESEND_API_KEY
 * EMAIL_FROM
 */

export default async function handler(req, res) {

  // --------------------------------------------------
  // CORS
  // --------------------------------------------------

  const allowedOrigin =
    process.env.ALLOWED_ORIGIN || "*";

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Responder ao preflight do navegador
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --------------------------------------------------
  // SOMENTE POST
  // --------------------------------------------------

  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido."
    });
  }

  // --------------------------------------------------
  // VERIFICAR CONFIGURAÇÃO
  // --------------------------------------------------

  const apiKey =
    process.env.RESEND_API_KEY;

  const emailFrom =
    process.env.EMAIL_FROM;

  if (!apiKey) {
    console.error(
      "RESEND_API_KEY não configurada."
    );

    return res.status(500).json({
      sucesso: false,
      erro:
        "O serviço de e-mail não está configurado no servidor."
    });
  }

  if (!emailFrom) {
    console.error(
      "EMAIL_FROM não configurado."
    );

    return res.status(500).json({
      sucesso: false,
      erro:
        "O endereço de envio não está configurado."
    });
  }

  // --------------------------------------------------
  // DADOS RECEBIDOS
  // --------------------------------------------------

  const {
    nome,
    email,
    prazoConfirmacao
  } = req.body || {};

  // --------------------------------------------------
  // VALIDAÇÕES
  // --------------------------------------------------

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      sucesso: false,
      erro: "O nome do convidado é obrigatório."
    });
  }

  if (!email || !String(email).trim()) {
    return res.status(400).json({
      sucesso: false,
      erro:
        "O endereço de e-mail do convidado é obrigatório."
    });
  }

  const emailNormalizado =
    String(email).trim().toLowerCase();

  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      emailNormalizado
    );

  if (!emailValido) {
    return res.status(400).json({
      sucesso: false,
      erro:
        "O endereço de e-mail informado é inválido."
    });
  }

  // --------------------------------------------------
  // PRAZO
  // --------------------------------------------------

  let prazo = prazoConfirmacao;

  if (!prazo) {
    const data = new Date();

    data.setDate(
      data.getDate() + 15
    );

    prazo =
      data.toLocaleDateString(
        "pt-PT"
      );
  }

  // --------------------------------------------------
  // ESCAPAR HTML
  // --------------------------------------------------

  function escapeHtml(valor) {

    return String(valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const nomeSeguro =
    escapeHtml(nome);

  const prazoSeguro =
    escapeHtml(prazo);

  // --------------------------------------------------
  // ASSUNTO
  // --------------------------------------------------

  const assunto =
    "💍 Pré-convite do nosso casamento";

  // --------------------------------------------------
  // HTML DO E-MAIL
  // --------------------------------------------------

  const html = `
<!DOCTYPE html>

<html lang="pt">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>Pré-convite</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f7f4f1;
    font-family:Arial,Helvetica,sans-serif;
    color:#333;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="padding:30px 15px;"
>

<tr>

<td align="center">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    max-width:620px;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,.08);
  "
>

<!-- CABEÇALHO -->

<tr>

<td
  style="
    background:linear-gradient(
      135deg,
      #8b5e5e,
      #b98282
    );
    color:#ffffff;
    padding:30px;
    text-align:center;
  "
>

<div
  style="
    font-size:38px;
    margin-bottom:10px;
  "
>
💍
</div>

<h1
  style="
    margin:0;
    font-size:25px;
  "
>
Casamento Perfeito
</h1>

<p
  style="
    margin:8px 0 0;
    opacity:.95;
  "
>
Pré-convite
</p>

</td>

</tr>

<!-- CONTEÚDO -->

<tr>

<td
  style="
    padding:35px 30px;
    line-height:1.7;
  "
>

<p
  style="
    font-size:18px;
    margin-top:0;
  "
>
Olá, <strong>${nomeSeguro}</strong>! 😊
</p>

<p>
Estamos muito felizes por partilhar consigo
que o nosso casamento está a chegar.
</p>

<p>
Gostaríamos muito de contar consigo neste
dia tão especial. ❤️
</p>

<p>
Pedimos, por favor, que confirme a sua
presença nos próximos <strong>15 dias</strong>.
</p>

<div
  style="
    background:#fff4db;
    border-radius:12px;
    padding:15px 18px;
    margin:25px 0;
    color:#76550b;
  "
>

<strong>
📅 Prazo para confirmação:
</strong>

<br>

${prazoSeguro}

</div>

<p>
Em breve partilharemos todos os detalhes
do casamento.
</p>

<p>
Será uma alegria celebrar este momento consigo!
</p>

<p
  style="
    margin-bottom:0;
  "
>

Com carinho,<br>

<strong>
Casamento Perfeito 💍
</strong>

</p>

</td>

</tr>

<!-- RODAPÉ -->

<tr>

<td
  style="
    background:#f8f3f3;
    padding:20px;
    text-align:center;
    color:#888;
    font-size:12px;
  "
>

Este é um pré-convite do Casamento Perfeito.

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;

  // --------------------------------------------------
  // TEXTO ALTERNATIVO
  // --------------------------------------------------

  const texto = `
Olá, ${nome}!

Estamos muito felizes por partilhar consigo
que o nosso casamento está a chegar.

Gostaríamos muito de contar consigo neste
dia tão especial. ❤️

Pedimos, por favor, que confirme a sua
presença nos próximos 15 dias.

Prazo para confirmação: ${prazo}

Em breve partilharemos todos os detalhes
do casamento.

Será uma alegria celebrar este momento consigo!

Com carinho,
Casamento Perfeito 💍
`;

  // --------------------------------------------------
  // ENVIAR PELO RESEND
  // --------------------------------------------------

  try {

    const resposta =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${apiKey}`
          },

          body: JSON.stringify({

            from: emailFrom,

            to: [
              emailNormalizado
            ],

            subject: assunto,

            html: html,

            text: texto

          })
        }
      );

    const resultado =
      await resposta.json();

    // ------------------------------------------------
    // ERRO DO RESEND
    // ------------------------------------------------

    if (!resposta.ok) {

      console.error(
        "Erro Resend:",
        resultado
      );

      return res.status(
        resposta.status || 500
      ).json({

        sucesso: false,

        erro:
          resultado?.message ||
          "Não foi possível enviar o e-mail."

      });
    }

    // ------------------------------------------------
    // SUCESSO
    // ------------------------------------------------

    return res.status(200).json({

      sucesso: true,

      mensagem:
        "Pré-convite enviado com sucesso.",

      id:
        resultado?.id || null

    });

  } catch (erro) {

    console.error(
      "Erro ao enviar e-mail:",
      erro
    );

    return res.status(500).json({

      sucesso: false,

      erro:
        "Erro interno ao enviar o pré-convite."

    });

  }

}
