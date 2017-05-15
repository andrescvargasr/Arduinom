'use strict';

module.exports = {
    name: 'Open bioreactor',
    description: '',
    url: '',
    maxParameters: 26,
    parameters: [
        {
            parameter: 'A', label: 'T°LIQ', description: 'Temperature of the bioreactor solution',
            factor: 100, unit: '°C',
            writable: false
        },

        {
            parameter: 'B', label: 'T°PCB', description: 'Temperature of the bioreactor circuit',
            factor: 100, unit: '°C',
            writable: false
        },

        {
            parameter: 'C', label: 'Weight', description: 'Weight of the bioreactor tank, in gr if calibrated',
            factor: 1, unit: 'gr',
            writable: false
        },

        {
            parameter: 'X', label: 'Weight Status', description: 'Status of the Weight control finite states machine, ' +
        ' the format is 0b BBBAAAAA AAAAAAAA where BBB codes the state of the machine and AAAAA AAAAAAAA the waiting ' +
        'time in minutes since the last status change',
            factor: 1, unit: '',
            writable: false
        },

        {
            parameter: 'Z',
                label: 'Bioreactor Status',
            description: 'Status of the Bioreactor, the bits of this integer code' +
        'for the state of specific elements of the reactor (eg. motor ON/OFF, PUMP ON/OFF etc.)',
            factor: 1,
            unit: '',
            writable: false
        },

        {
            parameter: 'AA',
                label: 'T°C Target',
            description: 'Desired regulated Temperature of the liquid in°C, reliable if the' +
        'desired temperature is at least a few degrees above room temperature.',
            max: 65.0,
            factor: 100,
            unit: '°C',
            writable: true
        },

        {
            parameter: 'AB', label: 'MAX T°C', description: 'Maximum temperature for the liquid and the circuit, the PID' +
        'heating regulation loop will stop if this temperature is exceeded.',
            max: 70,
            factor: 100, unit: '°C',
            writable: true
        },

        {
            parameter: 'AC',
                label: 'T°C PID Time',
            description: 'Regulation Time windows for the temperature PID control in' +
        'ms, typically set to 2000 but can be set as desired between to 500-20000 ms, serves as a base time for the duty cycle',
            factor: 1,
            unit: 'ms',
            writable: true
        },


        {
            parameter: 'AD', label: 'Max Weight', description: 'Maximum tank Weight, the Weight state machine' +
        'will go in standby mod if exceeded (internal tolerance is  considered on the circuit). to be set to 0-1500 gr',
            min: 0, max: 1500,
            factor: 1, unit: 'gr',
            writable: true
        },
        {
            parameter: 'AE', label: 'Min Weight', description: 'Minimum tank Weight, the Weight state machine' +
        'will go in standby mod if exceeded (internal tolerance is  considered on the circuit). To be set between 100-1500 gr',
            min: 100, max: 1500,
            factor: 1, unit: 'gr',
            writable: true
        },
        {
            parameter: 'AJ',
                label: 'Sedimentation Time',
            description: 'Sedimentation time in min after Semi-batch operation,' +
        'corresponds to the waiting time without stirring before emptying the reactor to the minimum level',
            min: 0,
            max: 32768,
            factor: 1,
            unit: 'min',
            writable: true
        },

        {
            parameter: 'AK', label: 'Filled Time', description: 'Filled time in min after Semi-batch operation,' +
        'corresponds to the total time with and without stirring before emptying the reactor to the minimum level' +
        'must be set longer than the sedimentation time if stirring is desired',
            min: 0, max: 32768,
            factor: 1, unit: 'min',
            writable: true
        }

    ]
};

