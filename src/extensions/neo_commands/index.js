// Core, Team, and Official extensions can `require` VM code:
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const mqtt = require('mqtt');


class NeoCommandBlocks {
    constructor (runtime) {
        /**
         * Store this for later communication with the Scratch VM runtime.
         * If this extension is running in a sandbox then `runtime` is an async proxy object.
         * @type {Runtime}
         */
        this.runtime = runtime;

        const url = 'ws://ironman:3000';
        const scratchId = `scratch_${Math.random().toString(16)
            .substr(2, 8)}`;

        this.clientMqtt = mqtt.connect(url, {
            clientId: scratchId
     
        });

        this.clientMqtt.on('connect', () => {
            console.log(`Scratch id ${scratchId} is connected to ${url}`);
        });
    }

    getInfo () {
        return {
            id: 'neoCommands',
            name: 'Neo Commands',
            blocks: [
                {
                    opcode: 'armAction',
                    blockType: BlockType.COMMAND,
                    text: '[ACTION] le bras [SIDE]',
                    arguments: {
                        SIDE: {
                            type: ArgumentType.STRING,
                            menu: 'sideMenu',
                            defaultValue: 'right'
                        },
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'actionArmMenu',
                            defaultValue: 'up'
                        }
                    }
                },
                {
                    opcode: 'handAction',
                    blockType: BlockType.COMMAND,
                    text: '[ACTION] la main [SIDE]',
                    arguments: {
                        SIDE: {
                            type: ArgumentType.STRING,
                            menu: 'sideMenu',
                            defaultValue: 'right'
                        },
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'actionHandMenu',
                            defaultValue: 'horizontal'
                        }
                    }
                },
                {
                    opcode: 'helmetAction',
                    blockType: BlockType.COMMAND,
                    text: '[ACTION] le casque',
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'actionHelmetMenu',
                            defaultValue: 'open'
                        }
                    }
                },
                {
                    opcode: 'headAction',
                    blockType: BlockType.COMMAND,
                    text: 'Tourner la tête [POSITION]',
                    arguments: {
                        POSITION: {
                            type: ArgumentType.STRING,
                            menu: 'positionHeadMenu',
                            defaultValue: 'middle'
                        }
                    }
                },
                {
                    opcode: 'eyesAction',
                    blockType: BlockType.COMMAND,
                    text: 'Colorier les yeux en [COLOR]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'energyAction',
                    blockType: BlockType.COMMAND,
                    text: 'Colorier le réacteur en [COLOR]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                }

            ],
            menus: {
                sideMenu: [
                    {
                        text: 'droit',
                        value: 'right'
                    },
                    {
                        text: 'gauche',
                        value: 'left'
                    }
                ],
                actionArmMenu: [
                    {
                        text: 'Lever',
                        value: 'up'
                    },
                    {
                        text: 'Baisser',
                        value: 'down'
                    },
                    {
                        text: 'Mettre au milieu',
                        value: 'middle'
                    },
                    {
                        text: 'Mettre vers le bas',
                        value: 'quarter'
                    },
                    {
                        text: 'Mettre vers le haut',
                        value: 'threequarter'
                    }
                ],
                actionHandMenu: [
                    {
                        text: 'Mettre vers le haut',
                        value: 'horizontal'
                    },
                    {
                        text: 'Mettre à l\'horizontale',
                        value: 'horizontal'
                    },
                    {
                        text: 'Mettre vers le bas',
                        value: 'vertical'
                    }
                ],
                actionHelmetMenu: [
                    {
                        text: 'Ouvrir',
                        value: 'open'
                    },
                    {
                        text: 'Fermer',
                        value: 'close'
                    }
                ],
                positionHeadMenu: [
                    {
                        text: 'à droite ',
                        value: 'right'
                    },
                    {
                        text: 'à gauche',
                        value: 'left'
                    },
                    {
                        text: 'au milieu',
                        value: 'middle'
                    }
                ]
            }
        };
    }

    publish (entity, command, payload){
        const payloadFinal = {
            origin: 'im-scratch'
        };

        if (payload){
            Object.entries(payload).forEach(([key, value]) => {
                payloadFinal[key] = value;
            });
        }

        console.log(`im/command/${entity}/${command}, ${JSON.stringify(payloadFinal)}`);

        this.clientMqtt.publish(`im/command/${entity}/${command}`, JSON.stringify(payloadFinal));
    }

    handAction (args) {

        switch (args.ACTION) {
            case 'up' :
                this.publish(`${args.SIDE}hand`, args.ACTION, {absPosition: 0});
                break;
            case 'horizontal' :
                this.publish(`${args.SIDE}hand`, args.ACTION, {absPosition: 50});
                break;
            case 'down' :
                this.publish(`${args.SIDE}hand`, args.ACTION, {absPosition: 100});
                break;
            default:
                console.log(`Action ${args.ACTION} not allowed with hand`);
        }
    }

    helmetAction (args) {

        switch (args.ACTION) {
            case 'open' :
                this.publish(`helmet`, args.ACTION);
                break;
            case 'close' :
                this.publish(`helmet`, args.ACTION);
                break;
            default:
                console.log(`Action ${args.ACTION} not allowed with helmet`);
        }
    }

    headAction (args) {

        switch (args.POSITION) {
            case 'right' :
                this.publish(`head`, 'facetrackmove', {absPosition: 100});
                break;
            case 'left' :
                this.publish(`head`, 'facetrackmove', {absPosition: 0});
                break;
            case 'middle' :
                this.publish(`head`, 'facetrackmove', {absPosition: 50});
                break;
            default:
                console.log(`Action ${args.POSITION} not allowed with head`);
        }
    }

    eyesAction (args) {
        this.publish(`eyes`, 'colorize', {rgb: args.COLOR.replace('#', '')});
    }

    energyAction (args) {
        this.publish(`energy`, 'colorize', {rgb: args.COLOR.replace('#', '')});
    }

    armAction (args) {

        switch (args.ACTION) {
            case 'up' :
                this.publish(`${args.SIDE}arm`, args.ACTION);
                break;
            case 'down' :
                this.publish(`${args.SIDE}arm`, args.ACTION);
                break;
            case 'middle' :
                this.publish(`${args.SIDE}arm`, 'set', {absPosition: 50});
                break;
            case 'quarter' :
                this.publish(`${args.SIDE}arm`, 'set', {absPosition: 25});
                break;
            case 'threequarter' :
                this.publish(`${args.SIDE}arm`, 'set', {absPosition: 75});
                break;
            default:
                console.log(`Action ${args.ACTION} not allowed with arm`);
        }
    }
}

module.exports = NeoCommandBlocks;
