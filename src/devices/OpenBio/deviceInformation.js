'use strict';

module.exports = {
    name: 'Open bioreactor',
    type: 'OpenBio',
    description: '',
    url: '',
    numberParameters: 52,
    numberLogParameters: 26,
    parameters: [
        {
            label: 'A', name: 'T° LIQ', description: 'Temperature of the bioreactor solution',
            factor: 100, unit: '°C',
            writable: false
        },

        {
            label: 'B', name: 'T° PCB', description: 'Temperature of the bioreactor circuit',
            factor: 100, unit: '°C',
            writable: false
        },

        {
            label: 'C', name: 'Pid', description: 'PID absolute value',
            factor: 1, unit: '',
            writable: false
        },

        {
            label: 'D', name: 'T° target', description: 'Target temperature',
            factor: 100, unit: '°C',
            writable: false
        },

        {
            label: 'E', name: 'Weight', description: 'Weight of the bioreactor tank, in internal value',
            factor: 1, unit: '',
            writable: false
        },

        {
            label: 'F', name: 'Weight', description: 'Weight of the bioreactor tank, in gr if calibrated',
            factor: 1, unit: 'g',
            writable: false
        },

        {
            label: 'G', name: 'Weight since last event', description: 'Time in min since last weight event',
            factor: 1, unit: 'min',
            writable: false
        },

        {
            label: 'H', name: 'Weight min', description: 'Weight min in internal unit',
            factor: 1, unit: '',
            writable: false
        },

        {
            label: 'I', name: 'Weight max', description: 'Weight max in internal unit',
            factor: 1, unit: '',
            writable: false
        },

        {
            label: 'Y', name: 'Error', description: '',
            factor: 1, unit: '',
            writable: false
        },

        {
            label: 'Z',
            name: 'Status',
            description: 'Status of the Bioreactor, the bits of this integer code' +
        'for the state of specific elements of the reactor (eg. motor ON/OFF, PUMP ON/OFF etc.)',
            factor: 1,
            unit: '',
            writable: false
        },

        {
            label: 'AA',
            name: 'Stepper speed',
            description: '',
            factor: 1,
            unit: 'RPM',
            writable: true
        },

        {
            label: 'AB',
            name: 'Stepper steps',
            description: 'Number of step before changing diretion. 1 tour = 200 step',
            factor: 1,
            unit: '',
            writable: true
        },

        {
            label: 'AF',
            name: 'Sedimentation Time',
            description: 'Sedimentation time in min after Semi-batch operation,' +
            'corresponds to the waiting time without stirring before emptying the reactor to the minimum level',
            min: 0,
            max: 32767,
            factor: 1,
            unit: 'min',
            writable: true
        },

        {
            label: 'AG', name: 'Filled Time', description: 'Filled time in min after Semi-batch operation,' +
        'corresponds to the total time with and without stirring before emptying the reactor to the minimum level' +
        'must be set longer than the sedimentation time if stirring is desired',
            min: 0, max: 32767,
            factor: 1, unit: 'min',
            writable: true
        },

        {
            label: 'AH', name: 'Weight factor', description: 'Factor allowing to convert the internal weight value to g',
            factor: 1,
            unit: '',
            writable: false
        },

        {
            label: 'AI', name: 'Weight offset', description: '',
            factor: 1,
            unit: '',
            writable: false
        },

        {
            label: 'AZ', name: 'Enable', description: '',
            factor: 1,
            unit: '',
            writable: false
        }

    ]
};

