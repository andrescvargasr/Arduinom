var table=[
    {
        parameter: "A", label: "T°PCB", description: "Temperature of the bioreactor circuit",
        factor: 100, unit:'C',
        min: 0, max: 50.0,
        writable:false
    },

    {
        parameter: "B", label: "T°LIQ", description: "Temperature of the bioreactor solution",
        factor: 100, unit:'C',
        min: 0, max: 50.0,
        writable:false
    },

    {
        parameter: "C", label: "WGT", description: "Weight of the bioreactor tank, in gr if calibrated",
        factor: 100, unit:'gr',
        min: 0, max: 1000.0,
        writable:false
    },

    ];

module.exports = table;