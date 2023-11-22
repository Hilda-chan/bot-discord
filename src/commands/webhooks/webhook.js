const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = 
{
    data : new SlashCommandBuilder()
    .setName("wb").setDescription("webhook manager")
    .addSubcommand(command => command.setName('add').setDescription('Create new webhook').addChannelOption(option => option.setName('channel').setDescription('Channel where wb will write').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('The name of the webhook').setRequired(true).setMinLength(1).setMaxLength(15)))
    .addSubcommand(command => command.setName('edit').setDescription('change webhook')
        .addStringOption(option => option.setName('wb-id').setDescription('The id of the webhook').setRequired(true))
        .addStringOption(option => option.setName('wb-token').setDescription('THe token of the webhook').setRequired(true))
        .addStringOption(option => option.setName('new-name').setDescription('Rename the webhook').setRequired(true)))
    .addSubcommand(command => command.setName('delete').setDescription('Remove a webhook')
        .addStringOption(option => option.setName('wb-id').setDescription('The ID of the webhook').setRequired(true))                                                                                                                                
        .addStringOption(option => option.setName('wb-token').setDescription('The token of the webhook').setRequired(true))),
    async execute (interaction)
    {
        if (!interaction.member.permission.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'Must be Admin to manage webhook', ephemeral: true});
        const sub = interaction.option.getSubcommand();

        switch (sub)
        {
            case 'add':
                await interaction.deferReply({ ephemeral: true});
                const name = await interaction.options.getString('name');
                const channel = await interaction.options.getString('channel');
                const webhook = await channel.createWebhook(
                    {
                        name: name,
                        channel: channel
                    }).catch(err => 
                        {
                            return interaction.editReply({content: 'Error in add webhook'})
                        });
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(':white_check_mark: Webhook created successfully')
                .addFields({ name: 'Webhook name', value: `> ${name}`, inline: true})
                .addFields({ channel: 'Webhook channel', value: `> ${channel}`, inline: true})
                .addFields({ name: 'Webhook URL', value: `> https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`, inline: true});

                await interaction.editReply({ embed: [embed], ephemeral: true});

                try
                {
                    await webhook.send({embeds: [new EmbedBuilder().setColor("Red").setDescription("Hello from webhook")]});
                } catch(err) {return;}
                
                break;
            case 'edit':
                await interaction.deferReply({ephemeral: true});
                const token = await interaction.options.getString('wb-token');
                const id = await interaction.options.getString('wb-id');
                let newname = await interaction.options.getString('new-name');

                const editwebhook = await interaction.guild.fetchWebhooks();

                await Promise.all(editwebhook.map(async webhook => {
                    if (webhook.token !== token || webhook.id !== id) await interaction.editReply({content: `Searching... No result found`});
                    else {
                        if (!newname) newname = webhook.name;
                        let oldname = webhook.name;

                        await webhook.edit({
                            name: newname,
                        }).catch(err => {return interaction.editReply({content: `Error in edit name`, ephemeral: true})});
                        const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(':white_check_mark: Webhook created successfully')
                        .addFields({ name: 'Webhook name', value: `> ${oldname} => ${newname}`, inline: true});

                        await interaction.options.editReply({embeds: [embed], content: ``});
                    }
                }));

                break;

            case 'delete':
                await interaction.options.deferReply({ephemeral: true});
                const deltoken = await interaction.options.getString(`wb-token`);
                const delid = await interaction.options.getString(`wb-id`);

                const delwebhook = await interaction.guild.fetchWebhooks();

                await Promise.all(delwebhook.map(async webhook => {
                    if (webhook.token !== deltoken || webhook.delid !== delid) return await interaction.editReply({content: `Error in Promise delete webhook`});
                    else {
                        await webhook.delete().catch(err => {return interaction.editReply({conten: `Webhook Deleted succeessfully`})})
                    }
                }))

        }
    }


}