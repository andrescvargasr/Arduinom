var table = [


    {
        parameter: 'A', label: 'Red point', description: 'which point of the linear detector is the maximum for red',
        factor: 1, unit: 'pixel#',
        writable: false
    },

    {
        parameter: 'B',
        label: 'Green point',
        description: 'which point of the linear detector is the maximum for green',
        factor: 1,
        unit: 'pixel#',
        writable: false
    },

    {
        parameter: 'C', label: 'Blue point', description: 'which point of the linear detector is the maximum for blue',
        factor: 1, unit: 'pixel#',
        writable: false
    },


    {
        parameter: 'D', label: 'Compression', description: '0 means no compression, can be set',
        factor: 1, unit: '',
        writable: true
    },
    {
        parameter: 'E', label: 'R-Intensity', description: 'Red led intensity (0 to 255)',
        factor: 1, unit: '',
        writable: false
    },

    {
        parameter: 'F', label: 'G-Intensity', description: 'Green led intensity (0 to 255)',
        factor: 1, unit: '',
        writable: false
    },
    {
        parameter: 'G', label: 'B-Intensity', description: 'Blue led intensity (0 to 255)',
        factor: 1, unit: '',
        writable: false
    },

    {
        parameter: 'H', label: 'Scan#', description: 'Number of scans (maximum 64)',
        factor: 1, unit: '',
        min: 1, max: 64,
        writable: true
    },

    {
        parameter: 'I', label: 'DelayExp', description: 'Delay between experiments in seconds',
        factor: 1, unit: 's',
        writable: false
    },

    {
        parameter: 'J', label: 'Acq Time', description: 'Accumulation time in ms(in ms, good value=30)',
        factor: 1, unit: 'ms',
        writable: true
    },

    {
        parameter: 'K', label: 'lambda-R', description: 'Red maximum wavelength (nm)',
        factor: 1, unit: 'nm',
        writable: false
    },

    {
        parameter: 'L', label: 'lambda-G', description: 'Green maximum wavelength (nm)',
        factor: 1, unit: 'nm',
        writable: false
    },

    {
        parameter: 'M', label: 'lambda-M', description: 'Blue maximum wavelength (nm)',
        factor: 1, unit: 'nm',
        writable: false
    },

    {
        parameter: 'U', label: 'red test', description: 'Set intensity of red led for test (0 -> 255)',
        factor: 1, unit: '',
        writable: false
    },
    {
        parameter: 'V', label: 'green test', description: 'Set intensity of green led for test (0 -> 255)',
        factor: 1, unit: '',
        writable: false
    },
    {
        parameter: 'W', label: 'blue test', description: 'Set intensity of blue led for test (0 -> 255)',
        factor: 1, unit: '',
        writable: false
    },
    {
        parameter: 'X', label: 'white test', description: 'Set intensity of white led for test (0 -> 255)',
        factor: 1, unit: '',
        writable: false
    },

];

module.exports = table;
