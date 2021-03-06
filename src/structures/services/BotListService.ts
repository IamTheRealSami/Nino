import NinoClient, { NinoConfig } from "../Client";
import wumpfetch from "wumpfetch";
import { Client } from "eris";

/**
 * Service that posts guild count to botlists.
 * @remarks
 * Posts every minute to all botlists.
 */
export default class BotListService {
    private client: NinoClient;
    private interval?: NodeJS.Timeout;

    constructor(client: NinoClient) {
        this.client = client;
    }

    /**
     * Start posting guild stats
     */
    start() {
        this.postCount(this.client.guilds.size, this.client.user.id, this.client.config, this.client.logger);
        this.interval = setInterval(async () => {
            const guilds = await this.client.redis.get("guilds");
            if (guilds)
                this.postCount(Number(guilds), this.client.user.id, this.client.config, this.client.logger);

        }, 60000);
    }

    /**
     * Stop posting guild stats
     */
    stop() {
        if (this.interval) {
            this.interval.unref();
        }
    }

    /**
     * Post guild stats
     */
    postCount(guilds: Number, id: string,  config: NinoConfig, logger: any) {
        if (config.dbltoken)
            wumpfetch({
                url: `https://discordbots.org/api/bots/${id}/stats`, 
                method: "POST",
                data: {
                    "server_count": guilds
                }
            }).header({
                "Authorization": config.dbltoken,
                "Content-Type": "application/json"
            }).send().then(res => {
                logger.info(`Posted guild stats to Discord Bot List: ${res.statusCode} : ${res.body}`);
            }).catch(() => {
                logger.error("Failed to post guild stats to Discord Bot List.");
            });
        if (config.bfdtoken)
            wumpfetch({
                url: `https://botsfordiscord.com/api/bot/${id}`, 
                method: "POST",
                data: {
                    "server_count": guilds
                }
            }).header({
                "Authorization": config.bfdtoken,
                "Content-Type": "application/json"
            }).send().then(res => {
                logger.info(`Posted guild stats to Bots For Discord: ${res.statusCode} : ${res.body}`);
            }).catch(() => {
                logger.error("Failed to post guild stats to Bots For Discord.");
            });
        if (config.dboatstoken)
            wumpfetch({
                url: `https://discord.boats/api/bot/${id}`, 
                method: "POST",
                data: {
                    "server_count": guilds
                }
            }).header({
                "Authorization": config.dboatstoken,
                "Content-Type": "application/json"
            }).send().then(res => {
                logger.info(`Posted guild stats to Discord Boats: ${res.statusCode} : ${res.body}`);
            }).catch(() => {
                logger.error("Failed to post guild stats to Discord Boats.");
            });
        if (config.blstoken)
            wumpfetch({
                url: `https://api.botlist.space/v1/bots/${id}`, 
                method: "POST",
                data: {
                    "server_count": guilds
                }
            }).header({
                "Authorization": config.blstoken,
                "Content-Type": "application/json"
            }).send().then(res => {
                logger.info(`Posted guild stats to Botlist.space: ${res.statusCode} : ${res.body}`);
            }).catch(() => {
                logger.error("Failed to post guild stats to Botlist.space.");
            });
    }
}
