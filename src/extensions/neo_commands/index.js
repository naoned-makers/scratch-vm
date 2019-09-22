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
                    opcode: 'raiseRightHarm',
                    blockType: BlockType.COMMAND,
                    text: 'Lever le bras droit',
                    arguments: {
                    }
                },
                {
                    opcode: 'lowRightHarm',
                    blockType: BlockType.COMMAND,
                    text: 'Baisser le bras droit',
                    arguments: {
                    }
                }
                // {
                //     opcode: 'raiseRightHarm',
                //     blockType: BlockType.COMMAND,
                //     text: 'Placer le bras droit à [NUM] pourcent',
                //     arguments: {
                //         NUM: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '1'
                //         }
                //     }
                // }
            ],
            menus: {
                fooMenu: {
                    items: ['a', 'b', 'c']
                }
            }
        };
    }

    raiseRightHarm (args) {
        this.clientMqtt.publish('im/command/rightarm/up', '{"origin":"im-scratch"}');
    }
    lowRightHarm (args) {
        this.clientMqtt.publish('im/command/rightarm/down', '{"origin":"im-scratch"}');
    }
}

module.exports = NeoCommandBlocks;
