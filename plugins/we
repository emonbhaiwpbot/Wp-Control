module.exports = {

  groupEvent: async ({
    sock,
    data,
    loadJSON,
    DB_FOLDER
  }) => {

    try {

      /*
      ========================================
      ADD EVENT ONLY
      ========================================
      */

      if (data.action !== "add")
        return;

      /*
      ========================================
      DATABASE
      ========================================
      */

      const path =
        `${DB_FOLDER}/groups.json`;

      const groups =
        loadJSON(path);

      const from =
        data.id;

      /*
      ========================================
      CHECK WELCOME
      ========================================
      */

      if (
        !groups[from] ||
        !groups[from].welcome
      ) return;

      /*
      ========================================
      GROUP INFO
      ========================================
      */

      const metadata =
        await sock.groupMetadata(from);

      const groupName =
        metadata.subject;

      const totalMembers =
        metadata.participants.length;

      const groupDesc =
        metadata.desc ||
        "No Description";

      const admins =
        metadata.participants
        .filter(v => v.admin)
        .map(v =>
          `@${v.id.split("@")[0]}`
        )
        .join(", ");

      /*
      ========================================
      TIME & DATE
      ========================================
      */

      const now =
        new Date();

      const time =
        now.toLocaleTimeString();

      const date =
        now.toLocaleDateString();

      /*
      ========================================
      NEW MEMBERS
      ========================================
      */

      for (let member of data.participants) {

        const userId =
          typeof member === "string"
            ? member
            : member.id;

        if (!userId)
          continue;

        /*
        ========================================
        WELCOME TEXT
        ========================================
        */

        let text =
          groups[from].welcomeText ||
`╭─〔 🌸 €м𝐨Ⓝ WELCOME 🌸 〕─╮

👋 Hello {user}

🎀 Group:
{group}

👥 Members:
{members}

{random}

╰────────────────╯`;

        /*
        ========================================
        RANDOM TEXT
        ========================================
        */

        const randoms =
          Array.isArray(
            groups[from].randomTexts
          )
            ? groups[from].randomTexts
            : [

              "🌸 Welcome To The Family",

              "🚀 Enjoy Your Stay",

              "🔥 Stay Active",

              "⚡ Respect Everyone"

            ];

        const randomText =
          randoms[
            Math.floor(
              Math.random() *
              randoms.length
            )
          ];

        /*
        ========================================
        PROFILE PHOTO
        ========================================
        */

        let pp = null;

        try {

          pp =
            await sock.profilePictureUrl(
              userId,
              "image"
            );

        } catch {}

        /*
        ========================================
        USERNAME
        ========================================
        */

        const username =
          `@${userId.split("@")[0]}`;

        /*
        ========================================
        VARIABLES
        ========================================
        */

        text = text.replace(
          /{user}/g,
          username
        );

        text = text.replace(
          /{group}/g,
          groupName
        );

        text = text.replace(
          /{members}/g,
          String(totalMembers)
        );

        text = text.replace(
          /{random}/g,
          randomText
        );

        text = text.replace(
          /{time}/g,
          time
        );

        text = text.replace(
          /{date}/g,
          date
        );

        text = text.replace(
          /{admin}/g,
          admins
        );

        text = text.replace(
          /{desc}/g,
          groupDesc
        );

        text = text.replace(
          /{pp}/g,
          pp || "No Photo"
        );

        /*
        ========================================
        SEND WITH PHOTO
        ========================================
        */

        if (pp) {

          await sock.sendMessage(
            from,
            {
              image: {
                url: pp
              },
              caption: text,
              mentions: [userId]
            }
          );

        } else {

          /*
          ========================================
          TEXT FALLBACK
          ========================================
          */

          await sock.sendMessage(
            from,
            {
              text,
              mentions: [userId]
            }
          );

        }

      }

    } catch (err) {

      console.log(
        "Welcome Error:",
        err
      );

    }

  }

};

