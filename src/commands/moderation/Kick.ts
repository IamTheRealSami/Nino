import { Punishment, PunishmentType } from '../../structures/managers/PunishmentManager';
import { Constants } from 'eris';
import NinoClient from '../../structures/Client';
import findUser from '../../util/UserUtil';
import Command from '../../structures/Command';
import Context from '../../structures/Context';
import PermissionUtils from '../../util/PermissionUtils';

export default class KickCommand extends Command {
    constructor(client: NinoClient) {
        super(client, {
            name: 'kick',
            description: 'Kicks a user from the guild',
            usage: '<user> <reason> [--reason]',
            aliases: ['boot'],
            category: 'Moderation',
            guildOnly: true,
            botpermissions: Constants.Permissions.kickMembers,
            userpermissions: Constants.Permissions.kickMembers
        });
    }

    async run(ctx: Context) {
        if (!ctx.args.has(0)) return ctx.send('Sorry but you will need to specify a user.');

        const u = findUser(this.client, ctx.args.get(0))!;
        if (!u) {
            return ctx.send('I can\'t find this user!');
        }
        const member = ctx.guild.members.get(u.id);

        if (!member) return ctx.send(`User \`${u.username}#${u.discriminator}\` is not in this guild?`);

        if (!PermissionUtils.above(ctx.message.member!, member))
            return ctx.send('The user is above you in the heirarchy.');

            let reason = (ctx.flags.get('reason') || ctx.flags.get('r') || ctx.args.has(1) ? ctx.args.slice(1).join(' ') : false);
            if (reason && typeof reason === 'boolean') return ctx.send('You will need to specify a reason');

        const punishment = new Punishment(PunishmentType.Kick, {
            moderator: ctx.sender
        });

        await ctx.send('User successfully kicked.');
        await this.client.punishments.punish(member!, punishment, (reason as string | undefined));
    }
}