// Core, Team, and Official extensions can `require` VM code:
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const mqtt = require('mqtt');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKIHdpZHRoPSIzNzkuMDAwMDAwcHQiIGhlaWdodD0iMzY5LjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgMzc5LjAwMDAwMCAzNjkuMDAwMDAwIgogcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+Cgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwzNjkuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNMCAzMTI1IGwwIC01NjUgMjYgLTYgMjYgLTcgLTI2IC0xNiBjLTIwIC0xMiAtMjYgLTI0IC0yNiAtNDkgMCAtMjAKNiAtMzUgMTUgLTM4IDI1IC0xMCA0NSAxNiA0NSA1NyAwIDQzIDkgNDggMzMgMjEgMTEgLTEyIDE1IC0yOCAxMSAtNTIgLTUgLTMyCi0yIC0zOCA0OCAtODEgNTQgLTQ3IDg4IC01OSAyMDMgLTc0IDgxIC0xMSAyNjAgLTI1IDM5OSAtMzEgMTI3IC02IDEyOSAtNgoxNDcgMTcgMTAgMTMgMTkgMjcgMTkgMzEgMCAzIC0zNSA2IC03OCA3IC04NiAxIC01MTggODIgLTYzMiAxMTggLTc2IDI0IC03NQoyMSAtMzUgMTc3IGwxOCA2OCA2NiAtNSBjMzYgLTQgMTEzIC0xNiAxNzEgLTI3IDEzMyAtMjYgMjM2IC00NiAzNzUgLTcwIDYxCi0xMSAxMzAgLTI2IDE1NSAtMzQgMzkgLTEyIDQ1IC0xNyA0MiAtMzcgbC00IC0yNCAyNyAyNSAyNiAyNSAzMjAgNCBjMTc1IDIKMzI5IDEgMzQxIC0zIDIzIC01IDM0IC0yMiA2OCAtMTA2IDEwIC0yNSAzMCAtNzAgNDQgLTEwMCBsMjYgLTU1IDE0NyAzIGMxODkKMyA1MTYgMzkgNzc4IDg2IDg4IDE1IDEzMCAyOSAxNDAgNDYgMyA1IDEwIDggMTUgNSA5IC02IDgyIDI5IDExNSA1NCAxMSA5IDIyCjI3IDIzIDQxIDUgMzAgMjcgNTcgMTE4IDE0MCA2NCA1OSAxMDQgMTEzIDEwNCAxNDEgMCAxNiAyNiAzOSA0NCAzOSAyMCAwIDMzCi0yNSA0MSAtODUgNCAtMjcgMTEgLTU0IDE1IC02MCA1IC01IDEwIC0yMSAxMiAtMzQgMSAtMTQgOCAtMjYgMTQgLTI4IDE0IC01CjE5IDI5IDM0IDIwNyAxMyAxNjMgMTQgMTY2IDUxIDE3OSAxOCA2IDM0IDExIDM3IDExIDcgMCAtNyAtMTU5IC0xOSAtMjA1IC01Ci0yMiAtMTIgLTg3IC0xNSAtMTQ1IC0zIC02MyAtMTMgLTEyOCAtMjUgLTE2MiAtMTEgLTMyIC0yNCAtODEgLTMwIC0xMDggLTkKLTQxIC0yMiAtNjMgLTcyIC0xMTUgLTEzNiAtMTQxIC0yMTIgLTIyNiAtMjI1IC0yNTAgLTcgLTE0IC0xOSAtMjUgLTI2IC0yNQotNyAwIC0yMSAtOSAtMzEgLTIwIC0xMCAtMTEgLTIzIC0yMCAtMjkgLTIwIC0xMyAwIC01NiAtMzIgLTEwNCAtNzggLTE5IC0xOAotNDcgLTQxIC02MyAtNTMgLTE2IC0xMSAtMjkgLTI2IC0yOSAtMzIgMCAtNyAtOTAgLTEwMiAtMjAwIC0yMTIgLTE1NCAtMTU0Ci0yMTcgLTIyNSAtMjc0IC0zMTAgLTE0OCAtMjE2IC0xNjEgLTIzNCAtMTcxIC0yMzkgLTYgLTIgLTUzIDAgLTEwNSA1IC01MiA1Ci0xOTIgMTMgLTMxMCAxOCAtMTE4IDUgLTMyNyAxNCAtNDY1IDIxIC0yMjMgMTEgLTQwMiA5IC02MzQgLTYgLTU1IC0zIC03OSAtMQotOTcgMTEgLTMwIDIwIC0zNyAxOSAtMzAgLTMgNCAtMTAgMCAtMjcgLTggLTM3IC04IC0xMSAtMTEgLTI0IC02IC0zMCA0IC01CjEzIC0yOCAyMCAtNTAgMTYgLTUwIDI3IC02NSA1MSAtNjUgMTMgMCAyMSAxMiAyOSAzOSA1IDIxIDE3IDQyIDI1IDQ1IDI2IDEwCjkyMCAtMTAgMTM4NyAtMzEgOTMgLTQgOTggLTYgMTE4IC0zMiAyMCAtMjggMjAgLTI5IDAgLTUxIC0xMSAtMTMgLTI1IC00MgotMzEgLTY0IC02IC0yMyAtMjAgLTY1IC0zMCAtOTQgLTEwIC0zMCAtMTkgLTYyIC0xOSAtNzIgMCAtMTAgLTggLTI2IC0xNyAtMzUKLTE3IC0xOCAtNjggLTE4IC0zNDggMiBsLTg5IDYgLTUyIDUzIC01MiA1MiAtMTQ5IDEgLTE0OCAyIC01MCAtNDYgLTUwIC00NwotMTk0IDMgYy0xMjcgMiAtMjAyIDggLTIxNyAxNiAtMjAgMTAgLTI0IDkgLTI0IC0zIDAgLTggLTQgLTE0IC0xMCAtMTQgLTUgMAotMTIgMCAtMTUgMCAtMiAwIC0xNiAtMTIgLTI5IC0yNSAtMjcgLTI3IC00NiAtMzIgLTQ2IC0xMiAwIDggLTMgOCAtOSAtMiAtMTAKLTE2IC01MyA0NyAtMTEwIDE2MSBsLTM0IDY4IDE4IDEwNyBjMTEgNjcgMjQgMTEzIDMzIDEyMCAxNyAxNCAxMyAzMyAtMjIgMTE4CmwtMTcgNDAgMjIgLTI3IGMxOSAtMjYgNDkgLTM4IDQ5IC0yMCAwIDE1IC00MCA5MiAtNDggOTIgLTQgMCAtMjEgMjUgLTM3IDU1Ci0xNSAzMCAtMzAgNTMgLTMzIDUwIC0zIC0yIC0xNiAxNyAtMzAgNDMgLTI5IDU2IC03MiAxMTggLTEwMSAxNDkgLTEyIDEyIC0yMQoyNyAtMjEgMzMgMCA2IC02IDEzIC0xNCAxNiAtOCAzIC0xNyAxMyAtMjAgMjIgLTMgOSAtMjggNTMgLTU2IDk3IC0yNyA0NCAtNzIKMTI1IC0xMDAgMTc5IC00NyA5NCAtNTAgMTAzIC01MCAxNzcgMCA4MiAtMTIgMTA3IC0zNyA3NCAtMTEgLTE2IC0xMyAtMjA4Ci0xMyAtMTA5NyBsMCAtMTA3OCAxMTQzIDMgYzc5NyAzIDExNjMgNyAxMjExIDE1IDUyIDkgNzggOSAxMTAgMCAyNyAtOCAxNTgKLTEzIDM3NSAtMTUgMjg2IC0zIDMzNyAtMSAzNTcgMTIgMjEgMTQgMjMgMTQgMTcgLTIgLTQgLTExIC0zIC0xNCA1IC05IDcgNAoxMiAxOSAxMiAzMiAwIDE0IDEwIDM1IDIzIDQ2IDEyIDExIDE2IDE3IDEwIDEzIC04IC00IC0xMSAtMSAtNyA5IDEwIDI3IDM5CjI3IDExMCAxIDM4IC0xNCA3MCAtMjUgNzEgLTI1IDIgMCAzIC0xOCAzIC00MCBsMCAtNDAgMTc1IDAgMTc1IDAgMCAzNjAgMAozNjAgLTUzIDAgYy01OSAwIC03NyAxMiAtNzcgNTAgMCAzNyA1IDM5IDQ4IDI0IDIwIC03IDQ3IC0xMyA2MCAtMTQgMjIgMCAyMgoyIDIyIDExNiBsMCAxMTYgLTM0IC02IGMtMzMgLTYgLTM0IC02IC0zOCAzMyAtNSA1NSAtMSA2MCAzOCA1NCBsMzQgLTYgMCA5MDQKYy0xIDg5MyAtMSA5MDQgLTIwIDg3OSAtMzIgLTQyIC01MCAtNjAgLTU5IC02MCAtMTQgMCAtMjEgNTUgLTIxIDE2MiAwIDU1IC00CjEwNyAtOSAxMTYgLTEyIDIzIC04MSA0MzYgLTg4IDUzMCBsLTYgNzIgLTQ2IDAgLTQ3IDAgLTEyIC01NyBjLTYgLTMyIC0xOQotMTAxIC0yOCAtMTUzIC0yNSAtMTQ5IC00NCAtMjEyIC05NiAtMzI4IC0xNSAtMzQgLTI4IC02OSAtMjggLTc2IDAgLTggLTQKLTE3IC04IC0yMCAtNSAtMyAtOCAtMTggLTcgLTMzIDEgLTE1IDAgLTIwIC0yIC05IC00IDE2IC03IDE1IC0xOSAtOSAtMTUgLTMwCi0xOSAtNTkgLTUgLTM2IDYgOSAxMSAxMCAxNSAyIDQgLTYgNCAtMTUgMSAtMjEgLTMgLTUgMCAtMTAgNyAtMTAgNyAwIDQgLTgKLTkgLTIxIC0yNiAtMjYgLTQ1IC0xNyAtMzggMTkgMyAxNSAyIDIwIC0xIDEyIC00IC04IC0xMiAtMTggLTE4IC0yMiAtOCAtNgotNyAtMTEgMyAtMTcgMTQgLTkgNyAtMzEgLTEwIC0zMSAtNiAwIC04IDQgLTUgOSA0IDUgLTMgNyAtMTQgNCAtMTEgLTMgLTIwIDAKLTIwIDYgMCA2IC03IDExIC0xNSAxMSAtOCAwIC0xNSA0IC0xNSA5IDAgNSAtMTggMTIgLTQwIDE2IC0yMiA0IC0zOCAxMSAtMzQKMTYgMyA1IDEgOSAtNSA5IC01IDAgLTExIC01IC0xMyAtMTAgLTIgLTYgLTE0IDggLTI4IDMwIC0xNCAyMyAtMzIgNDAgLTQzIDQwCi0xMCAwIC03OCAtMjUgLTE1MCAtNTYgLTIxNCAtOTEgLTI2MiAtMTA0IC02NTcgLTE3NCAtNTggLTExIC0xMzYgLTI2IC0xNzUKLTM0IC0xNjEgLTM2IC0zNzggLTUwIC03NzUgLTUwIC0zNjEgMCAtMzkyIDEgLTUwMCAyMiAtNjMgMTMgLTE1NSAzMCAtMjA1IDM4Ci0yMTcgMzYgLTI3MiA1MiAtMzg5IDExMCBsLTExNiA1NyAwIDQxIGMwIDIzIDUgMTEzIDEwIDIwMSAxMiAxNzMgMTAgMTY2IDEyNAo0MzMgbDM1IDgyIC0xMDQgMCAtMTA1IDAgMCAtNTY1eiBtMzU3MCAyMTQgYzAgLTUgNSAtNyAxMCAtNCA2IDMgMTMgLTEgMTcKLTEwIDMgLTEwIDEgLTIwIC01IC0yNCAtMTEgLTYgLTE0IC0yMSAtMjkgLTEzMyAtNSAtMzkgLTExIC01MSAtMzcgLTY3IC0xNwotMTEgLTM0IC0xNyAtMzcgLTEzIC03IDggOCAxNzggMTggMjAyIDggMjAgMTAgMjcgMTIgNDUgMSAxNyA1MSAyMSA1MSA0egptLTY5OSAtNjU2IGMyMiAtNDggNDMgLTEwMiA0NiAtMTE5IDUgLTI5IDIgLTMyIC0zNSAtNDcgLTUwIC0yMCAtMTk3IC01NwotMjI3IC01NyAtMTMgMCAtOTIgLTEzIC0xNzcgLTMwIC04NCAtMTYgLTE3OCAtMzQgLTIwOCAtNDAgLTMwIC01IC05MCAtMTYKLTEzNCAtMjUgLTExMCAtMjEgLTIxOCAtMjAgLTIzOCAzIC0yMSAyNCAtNjYgMTI2IC03NCAxNjYgLTYgMzQgLTYgMzQgNDggNDkKNTYgMTcgMjY3IDU5IDUwOCAxMDIgODAgMTQgMjA4IDM5IDI4NSA1NSA3NyAxNiAxNDUgMjkgMTUyIDI5IDcgMSAzMSAtMzggNTQKLTg2eiBtODQxIDYyIGM2IC0xNCAxOSAtMjUgMzAgLTI1IDI2IDAgMjIgLTE4IC00IC0yMiAtMTggLTIgLTIzIC0xMCAtMjQgLTM2Ci0xIC0yOSAtMjUgLTYxIC00NiAtNjIgLTEwIDAgLTEwIDk1IC0yIDEzOSA4IDM3IDMwIDQwIDQ2IDZ6IG0tMzM3MCAtMTIzOApjMTQgLTI4IDI4IC03MCAzMSAtOTIgMiAtMjIgMTQgLTg1IDI2IC0xNDAgMTIgLTU1IDI0IC0xMjAgMjcgLTE0NSA3IC01NiAwCi00OCAtNjYgODUgLTQ1IDkxIC01MSAxMTEgLTYwIDIwMCAtNSA1NSAtMTAgMTEwIC0xMCAxMjMgMCAzOCAyNCAyNCA1MiAtMzF6Cm0tMzcgLTI4NyBsMCAtMzUgLTcxIC0zIGMtNzQgLTMgLTEwMSA5IC04OSA0MCAxMCAyNSA0NyAzNyAxMDUgMzUgbDU1IC0yIDAKLTM1eiBtMzIxNCAtOTMgYzEgLTM0IC0zIC01OSAtMTMgLTcyIC0xNCAtMTkgLTE1IC0xNSAtMTYgNDYgMCA2MiA0IDc5IDIwIDc5CjQgMCA4IC0yNCA5IC01M3ogbS0zMjAxIDYgYzUgLTEwIDIxIC01NCAzNiAtOTggMjQgLTczIDI3IC05MiAyNCAtMjA1IGwtMwotMTI1IC0zOCAxMzQgYy00MCAxMzkgLTYyIDMxMSAtMzkgMzExIDYgMCAxNSAtOCAyMCAtMTd6IG0zNDYyIDcgYzAgLTUgLTQKLTEwIC05IC0xMCAtNiAwIC0xMyA1IC0xNiAxMCAtMyA2IDEgMTAgOSAxMCA5IDAgMTYgLTQgMTYgLTEweiBtLTEwNzAgLTExMApjMCAtNSAtMiAtMTAgLTQgLTEwIC0zIDAgLTggNSAtMTEgMTAgLTMgNiAtMSAxMCA0IDEwIDYgMCAxMSAtNCAxMSAtMTB6Cm0tMjI4MCAtODg0IGMwIC03IC03IC0xOSAtMTUgLTI2IC04IC03IC0xNSAtMjAgLTE1IC0zMCAwIC0zMCAtMjMgLTM5IC0xMDMKLTQxIC04NSAtMiAtOTcgMiAtNzcgMjYgNDIgNTAgMjEwIDEwNyAyMTAgNzF6Ii8+CjxwYXRoIGQ9Ik0zMjgyIDI5MzAgYzAgLTE0IDIgLTE5IDUgLTEyIDIgNiAyIDE4IDAgMjUgLTMgNiAtNSAxIC01IC0xM3oiLz4KPHBhdGggZD0iTTMzNjQgMjQ5NSBjLTQgLTkgNCAtMzEgMTcgLTUwIDIxIC0zMSAyNSAtMzIgMzEgLTE1IDcgMjAgNCA1MiAtNwo3MCAtOSAxNSAtMzUgMTIgLTQxIC01eiIvPgo8cGF0aCBkPSJNNjgwIDgzMCBjLTEzIC04IC0xMiAtMTAgMyAtMTAgOSAwIDE3IDUgMTcgMTAgMCAxMiAtMSAxMiAtMjAgMHoiLz4KPHBhdGggZD0iTTY2NyA3ODcgYy0zIC05IC0yIC0xOSA0IC0yMyAxNSAtOSAxOCAtMiA5IDIwIC02IDE3IC03IDE4IC0xMyAzeiIvPgo8L2c+Cjwvc3ZnPgo=';



class NeoCommandBlocks {
    constructor (runtime) {
        /**
         * Store this for later communication with the Scratch VM runtime.
         * If this extension is running in a sandbox then `runtime` is an async proxy object.
         * @type {Runtime}
         */
        this.runtime = runtime;

        const url = 'ws://ironman.local:3000';
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
            id: 'neo',
            name: 'Neo Commands',
            blockIconURI: blockIconURI,
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
                            defaultValue: 'horizontal_right'
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
                },
                {
                    opcode: 'energyEyesAction',
                    blockType: BlockType.COMMAND,
                    text: 'Colorier le réacteur et les yeux en [COLOR]',
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
                        text: 'droit(e)',
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
                        value: 'vertical'
                    },
                    {
                        text: 'Mettre à l\'horizontale vers la droite',
                        value: 'horizontal_right'
                    },
                    {
                        text: 'Mettre à l\'horizontale vers la gauche',
                        value: 'horizontal_left'
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

        switch (args.SIDE) {
            case 'right' :
                switch (args.ACTION) {
                    case 'horizontal_right' :
                        this.publish(`${args.SIDE}hand`, 'set', {absPosition: 125});
                        break;
                    case 'vertical' :
                        this.publish(`${args.SIDE}hand`, 'set', {absPosition: 60});
                        break;
                    case 'horizontal_left' :
                        this.publish(`${args.SIDE}hand`, 'set', {absPosition: -25});
                        break;
                    default:
                        console.log(`Action ${args.ACTION} not allowed with hand`);
                }
                break;
            case 'left' :
                switch (args.ACTION) {
                    case 'horizontal_right' :
                        this.publish(`${args.SIDE}hand`, 'set', {absPosition: 115});
                        break;
                    case 'vertical' :
                        this.publish(`${args.SIDE}hand`, 'set', {absPosition: 40});
                        break;
                    case 'horizontal_left' :
                        this.publish(`${args.SIDE}hand`, 'set', {absPosition: 0});
                        break;
                    default:
                        console.log(`Action ${args.ACTION} not allowed with hand`);
                }
                break;           
            default :
                console.log(`Side ${args.SIDE} not allowed with hand`);
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

    energyEyesAction (args) {
        this.publish(`energy`, 'colorize', {rgb: args.COLOR.replace('#', '')});
        this.publish(`eyes`, 'colorize', {rgb: args.COLOR.replace('#', '')});
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
