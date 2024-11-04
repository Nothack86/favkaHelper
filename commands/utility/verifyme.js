const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { mailPass, mailUser, mailHost, roleOvereny } = require('../../config.json');

function mailSender(targetOrion, sendMess) {
    // Vytvořte transport
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: 465,
        secure: true, // true pro 465, na ostatních portech to nejede 
        auth: {
            user: mailUser,
            pass: mailPass
        }
    });

    // sestavení adresy příjemce
    // @students.zcu.cz
    let mailTarget = targetOrion + "@students.zcu.cz";

    // Vygenerování ověřovacího kódu
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let mailCode = '';
    for (let i = 0; i < 6; i++) {
        mailCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Nastavení e-mailu
    let mailOptions = {
        from: '"Odesílatel" <api@seflik.cz>',
        to: mailTarget,
        subject: 'FAVka gang ověřovací kód: ' + mailCode,
        text: mailCode
    };

    // Odeslání e-mailu
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error(error.cause);
        }
    });
    if (sendMess === true) {
        console.log('E-mail byl úspěšně odeslán');
    }
    return mailCode;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verifyme')
        .setDescription('Ověří že jsi student FAVky')
        .addSubcommand(subcommand =>
            subcommand
                .setName('sendmail')
                .setDescription('Pošle verifikační kód na zadaný Orion email')
                .addStringOption(option =>
                    option.setName('orion')
                        .setDescription('Orion login k ověření(a. k. a. první část tvé mail adresy)')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('code')
                .setDescription('Přijme ověřovací kód zaslaný na tvůj email')
                .addStringOption(option =>
                    option.setName('verifcode')
                        .setDescription('Šestimístný kód z tvého emailu')
                        .setRequired(true)
                        .setMinLength(6)
                        .setMaxLength(6)
                )
        ),


    async execute(interaction) {
        const orion = interaction.options.getString('orion');
        const verifcode = interaction.options.getString('verifcode');
        const subcommand = interaction.options.getSubcommand();

        fs.readFile('./favaci.json', 'utf8', (err, jsonString) => {
            if (err) {
                console.error('Chyba při čtení souboru:', err);
                return;
            }
            const data = JSON.parse(jsonString);

            // rozhodne jaký subcommand se má spustit
            if (subcommand === 'sendmail') {
                const item = data.find(item => item.discordid === interaction.member.user.id);
                console.log(item);

                // jaká operace se záznamem se má provést (nový, upravit, existuje totožný => nic)
                if (item !== undefined) {
                    if (item.trys >= 3) {
                        interaction.reply({ content: "Počet pokusů vyčerpán", ephemeral: true });
                    } else if (item.orion == orion) {
                        interaction.reply({ content: "Tento email už máš zaregistrovaný", ephemeral: true });
                    } else if (item.checked == true) {
                        interaction.reply({ content: "Tvůj účet už je ověřený", ephemeral: true });
                    } else {
                        // přepíše orion v souboru
                        item.orion = orion;
                        item.verif = mailSender(orion, false);
                        item.trys = item.trys + 1;
                        const updatedJsonString = JSON.stringify(data, null, 2);

                        // Uložení aktualizovaného JSON zpět do souboru
                        fs.writeFile('./favaci.json', updatedJsonString, (err) => {
                            if (err) {
                                console.error('Chyba při ukládání souboru:', err);
                                interaction.reply({ content: "Něco se pokazilo", ephemeral: true });
                            } else {
                                console.log('Orion uživate %s změněn', orion);
                                const replMess = "Orion byl aktualizován. V případě potřeby jej můžeš ještě "+ (3-item.trys) + " krát změnit.";
                                interaction.reply({ content: replMess, ephemeral: true });
                            };
                        });
                    };
                } else {
                    const mailCode = mailSender(orion, true);

                    // Přidání nového prvku do pole
                    data.push({ discordid: interaction.member.user.id, discordname: interaction.member.user.username, orion: orion, verif: mailCode, checked: false, trys: 1 });

                    // Převedení pole zpět na JSON
                    const updatedJsonString = JSON.stringify(data, null, 2);

                    // Uložení aktualizovaného JSON zpět do souboru
                    fs.writeFile('./favaci.json', updatedJsonString, (err) => {
                        if (err) {
                            console.error('Chyba při ukládání souboru:', err);
                            interaction.reply({ content: "Něco se pokazilo", ephemeral: true });
                        } else {
                            console.log('Data úspěšně aktualizována a uložena do souboru data.json');
                            interaction.reply({ content: "Verifikační kód byl odeslán", ephemeral: true });
                        }
                    });
                }
            } else if (subcommand === 'code') {
                // Najdi strukturu podle discordid a změň hodnotu checked
                const item = data.find(item => item.discordid === interaction.member.user.id);
                if (item.verif == verifcode) {
                    item.checked = true;
                    console.log('Aktualizovaná struktura:', item);

                    // Ulož zpět do souboru
                    const updatedJsonString = JSON.stringify(data, null, 2);
                    fs.writeFile('./favaci.json', updatedJsonString, (err) => {
                        if (err) {
                            console.error('Chyba při ukládání souboru:', err);
                        } else {

                            // úspěšné provedení
                            console.log('Data úspěšně aktualizována a uložena.');
                            interaction.member.roles.add(roleOvereny);
                            interaction.reply({ content: "Tvůj účet byl úspěšně ověřen", ephemeral: true });
                        }
                    });
                } else {
                    console.log('Zadán špatný kód');
                    interaction.reply({ content: "Zadán chybný kód", ephemeral: true });
                }
            }
        });
    },
};