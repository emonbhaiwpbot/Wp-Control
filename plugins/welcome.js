module.exports = {

  config: {
    name: "welcome",
    aliases: ["wel"],
    group: true,
    admin: true
  },

  run: async ({
    sock,
    m,
    args,
    loadJSON,
    saveJSON,
    DB_FOLDER
  }) => {

    try {

      const path =
        `${DB_FOLDER}/groups.json`;

      const groups =
        loadJSON(path);

      const from =
        m.key.remoteJid;

      /*
      ========================================
      DEFAULT
      ========================================
      */

      if (!groups[from]) {

        groups[from] = {

          welcome: false,

          welcomeText:
`╭─〔 🌸 €м𝐨Ⓝ WELCOME 🌸 〕─╮

👋 Hello {user}

🎀 Group:
{group}

👥 Members:
{members}

🕒 Time:
{time}

📅 Date:
{date}

👑 Admin:
{admin}

📝 Description:
{desc}

{random}

╰────────────────╯`,

          randomTexts: [

            "🌸 Welcome To The Family",
            "🚀 Enjoy Your Stay",
            "🔥 Stay Active",
            "⚡ Respect Everyone"

          ]

        };

        saveJSON(path, groups);

      }

      const option =
        (args[0] || "")
        .toLowerCase();

      /*
      ========================================
      ON
      ========================================
      */

      if (option === "on") {

        groups[from].welcome = true;

        saveJSON(path, groups);

        return sock.sendMessage(
          from,
          {
            text:
`╭─〔 🌸 WELCOME SYSTEM 🌸 〕─╮

✅ Welcome Enabled

⚡ Auto Welcome Active

╰────────────────╯`
          },
          {
            quoted: m
          }
        );

      }

      /*
      ========================================
      OFF
      ========================================
      */

      if (option === "off") {

        groups[from].welcome = false;

        saveJSON(path, groups);

        return sock.sendMessage(
          from,
          {
            text:
`╭─〔 🌸 WELCOME SYSTEM 🌸 〕─╮

❌ Welcome Disabled

╰────────────────╯`
          },
          {
            quoted: m
          }
        );

      }

      /*
      ========================================
      SET MESSAGE
      ========================================
      */

      if (option === "set") {

        const text =
          args.slice(1).join(" ");

        if (!text) {

          return sock.sendMessage(
            from,
            {
              text:
`.welcome set Hello {user}`
            },
            {
              quoted: m
            }
          );

        }

        groups[from].welcomeText =
          text;

        saveJSON(path, groups);

        return sock.sendMessage(
          from,
          {
            text:
"✅ Welcome Text Updated"
          },
          {
            quoted: m
          }
        );

      }

      /*
      ========================================
      RANDOM ADD
      ========================================
      */

      if (option === "random") {

        const text =
          args.slice(1).join(" ");

        if (!text) {

          return sock.sendMessage(
            from,
            {
              text:
`.welcome random Welcome Bro`
            },
            {
              quoted: m
            }
          );

        }

        groups[from]
        .randomTexts
        .push(text);

        saveJSON(path, groups);

        return sock.sendMessage(
          from,
          {
            text:
"✅ Random Text Added"
          },
          {
            quoted: m
          }
        );

      }

      /*
      ========================================
      STATUS PANEL
      ========================================
      */

      await sock.sendMessage(
        from,
        {
          text:
`╭─〔 🌸 €м𝐨Ⓝ WELCOME PANEL 🌸 〕─╮

⚡ Status:
${groups[from].welcome ? "ON ✅" : "OFF ❌"}

━━━━━━━━━━━━━━━

🛠 Commands:

.welcome on
.welcome off

.welcome set TEXT

.welcome random TEXT

━━━━━━━━━━━━━━━

📝 Variables:

{user}
{group}
{members}
{time}
{date}
{admin}
{desc}
{random}

╰────────────────╯`
        },
        {
          quoted: m
        }
      );

    } catch (err) {

      console.log(err);

    }

  }

};

